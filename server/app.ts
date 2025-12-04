import logger from "./modules/logger";
import config from "./config";

import { getUsername } from "./modules/utils/user"; 
import { Room } from "./modules/interface";
import { validateUsername } from "./modules/filters/username";
import { MinLengthError, InvalidCharacterError, MaxLengthError } from "./modules/errors";

import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from 'uuid';
import { createClient, RedisClientType } from 'redis';
import { Db, MongoClient } from 'mongodb';

import http from "http";
import url from "url";
import amqp from 'amqplib';

/*
* Constants
* TODO: Move to a configuration file
*   - Buscar configurações a partir de arquivo de configuração
*/
const port = config.port;
const rabbitMQUrl = config.rabbitMQ.url;
const mongodbUrl = config.mongodb.url;
const redisUrl = config.redis.url;

/*
* Variables and instances global to the application
*/
const rooms: Room = {};

const server = http.createServer();
const wsServer = new WebSocketServer({ server });

/*
* Código do aplicativo
*
* Contém todo o código referente à lógica de negócios do aplicativo,
* incluindo a lógica de manipulação de mensagens WebSocket.
*/ 
const handleClose = (room: string, uuid: string) => {
  const user = rooms[room].users[uuid];
  if (user) {
    logger.info({ msg: `user '${user.username}' in room '${room}' disconnected`, ip: user.ip, username: user.username, room, uuid, status: 'disconnected' });
    delete rooms[room].users[uuid];
  }
}

/**
 * Consulta o banco de dados para obter a última mensagem enviada na sala.
 * 
 * @param mongoDb 
 * @param room 
 * @returns JSON.stringfy({ _id: string; message: { room: string; message: string; uuid: string; } }) | undefined
 */
async function getLastMessageFromDatabase(mongoDb: Db, room: string): Promise<string | undefined> {
  const lastMessage = await mongoDb.collection(room)
    .find({ room })
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  if (lastMessage.length === 0) return;

  return JSON.stringify(lastMessage[0]);
}

/**
 * Envia a última mensagem da sala para todos os usuários conectados.
 * 
 * @param mongoDb 
 * @param room 
 * @returns { void }
 */
const broadcast = async (mongoDb: Db, room: string) => {
  const message = await getLastMessageFromDatabase(mongoDb, room);

  if (!message) return;

  const document = JSON.parse(message);
  const messageJsonStringfy = JSON.stringify(document.message);
  const messageObject = document.message;

  Object.keys(rooms[room].users).forEach((uuid) => {
    const connection = rooms[room].users[uuid].connection;
    connection.send(messageJsonStringfy);
  });

  logger.debug({ msg: `update room '${room}' with last message from user '${messageObject.username}'`, room })
  rooms[room].lastNote = messageJsonStringfy;
};

/**
 * Salva a mensagem no banco de dados.
 * 
 * @param mongoDb 
 * @param room 
 * @param message 
 * @param uuid 
 */
const saveMessageToDatabase = async (
  mongoDb: Db, room: string, message: string, ip: string, uuid: string
) => {
  await mongoDb.collection(room).insertOne({ room, message, ip, uuid });
};

const getLastMessageFromCache = async (redisClient: RedisClientType, room: string): Promise<string|undefined> => {
  const cacheKey = `room:${room}:messages`;
  try {
    const result = await redisClient.lRange(cacheKey, 0, 0);
    if (result.length === 0) {
      return;
    }
    logger.debug({ msg: `find last message on cache`, room });
    return Buffer.from(result[0]).toString('utf-8');
  } catch (err) {
    console.error('Redis error:', err);
  }
};

/**
 * Consulta o cache (Redis) para obter todas as mensagens da sala.
 * 
 * @param redisClient 
 * @param room 
 * @returns Array de mensagens do cache
 */
const getAllMessagesFromCache = async (redisClient: RedisClientType, room: string): Promise<string[]> => {
  const cacheKey = `room:${room}:messages`;
  try {
    const results = await redisClient.lRange(cacheKey, 0, 99); // Busca até 100 mensagens (mesmo limite do lTrim)
    if (results.length === 0) {
      return [];
    }
    logger.debug({ msg: `find ${results.length} messages on cache`, room });
    // Retorna as mensagens em ordem cronológica (mais antiga primeiro)
    return results.reverse().map(msg => Buffer.from(msg).toString('utf-8'));
  } catch (err) {
    console.error('Redis error:', err);
    return [];
  }
};

/**
 * Consulta o banco de dados para obter todas as mensagens da sala.
 * 
 * @param mongoDb 
 * @param room 
 * @param limit - Número máximo de mensagens a retornar (padrão: 100)
 * @returns Array de mensagens do banco de dados
 */
async function getAllMessagesFromDatabase(mongoDb: Db, room: string, limit: number = 100): Promise<string[]> {
  const messages = await mongoDb.collection(room)
    .find({ room })
    .sort({ _id: 1 }) // Ordem cronológica (mais antiga primeiro)
    .limit(limit)
    .toArray();

  if (messages.length === 0) return [];

  return messages.map(msg => JSON.stringify(msg));
}

const saveMessageToCache = async (
  redisClient: RedisClientType, room: string, message: string, ip: string, uuid: string
) => {
  const cacheKey = `room:${room}:messages`;
  const messageData = JSON.stringify({ message, ip, uuid });

  try {
    await redisClient.lPush(cacheKey, messageData);
    await redisClient.lTrim(cacheKey, 0, 99);
  } catch (err) {
    console.error('Redis error:', err);
  }
};

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    logger.error({ msg: 'Failed to connect to RabbitMQ', error });
    throw error;
  }
};

async function connectToMongoDB() {
  const mongoClient = new MongoClient(mongodbUrl);
  await mongoClient.connect();

  return mongoClient.db('past_copy');
}

const setupRabbitMQConsumer = async (mongoDb: Db, redisClient: RedisClientType) => {
  const { channel } = await connectToRabbitMQ();

  const queue = 'chat_messages';
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { room, message, ip, uuid } = JSON.parse(msg.content.toString());
      logger.trace({ msg: `received message from RabbitMQ`, ip, room, message, uuid });

      await saveMessageToDatabase(mongoDb, room, message, ip, uuid);
      await saveMessageToCache(redisClient, room, message, ip, uuid);

      await broadcast(mongoDb, room);

      channel.ack(msg);
    }
  });
};

const setupWebSocketServer = async (mongoDb: Db, redisClient: RedisClientType) => {
  wsServer.on("connection", async (wsConnection, request) => {
    const { channel } = await connectToRabbitMQ();

    const ip = request.socket.remoteAddress;
    if (!ip) {
      wsConnection.close();
      return;
    }
    request.url = request.url || "";
    const room = (url.parse(request.url).pathname || "welcome").replace("/", "");
    const queryValues = url.parse(request.url, true).query;
    const username = getUsername(queryValues);

    try {
      validateUsername(username);
    } catch (error) {
      if (
        error instanceof MinLengthError ||
        error instanceof InvalidCharacterError ||
        error instanceof MaxLengthError
      ) {
        logger.error({ msg: 'Failed to validate username', error, username });
        wsConnection.close();
        return;
      }
    }

    const uuid = uuidv4();

    logger.info({ msg: `user '${username}:${ip}' in room '${room}' connected`, ip, user: username, room, uuid, status: 'connected' });

    if (!rooms[room]) rooms[room] = { lastNote: "", users: {} };

    rooms[room].users[uuid] = { username, uuid, ip, connection: wsConnection };

    /*
    * Buscar histórico completo de mensagens a partir do Redis ou banco de dados.
    */
    const cachedMessages = await getAllMessagesFromCache(redisClient, room);
    let allMessages: string[] = [];

    if (cachedMessages.length > 0) {
      // Se há mensagens no cache, usa elas
      allMessages = cachedMessages;
    } else {
      // Se não há no cache, busca do banco de dados
      allMessages = await getAllMessagesFromDatabase(mongoDb, room);
    }

    // Enviar histórico completo para o cliente
    if (allMessages.length > 0) {
      // Enviar um array com todas as mensagens em uma única mensagem WebSocket
      const messagesArray = allMessages.map(msgStr => {
        const parsed = JSON.parse(msgStr);
        return parsed.message;
      });
      
      // Enviar como um objeto especial que indica que é o histórico inicial
      wsConnection.send(JSON.stringify({
        type: 'history',
        messages: messagesArray
      }));
      
      logger.debug({ msg: `sent ${messagesArray.length} messages history to user`, room, username, messageCount: messagesArray.length });
    }

    const queue = 'chat_messages';
    await channel.assertQueue(queue, { durable: true });

    wsConnection.on("message", async (bytes) => {
      const message = JSON.parse(bytes.toString());
      logger.trace({ msg: `received message from websocket`, room, ip, message, uuid });

      channel.sendToQueue(queue, Buffer.from(JSON.stringify({ room, ip, message, uuid })), { persistent: true });
    });

    wsConnection.on("close", () => handleClose(room, uuid));
  });
};

const startServer = async () => {
  const mongoDb = await connectToMongoDB();
  const redisClient = await createClient({ url: redisUrl })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

  await setupRabbitMQConsumer(mongoDb, redisClient as RedisClientType);
  await setupWebSocketServer(mongoDb, redisClient as RedisClientType);

  server.listen(port, '0.0.0.0', () => {
    logger.info({ msg: `WebSocket server is running on port ${port}` });
  });
};

startServer().catch(error => {
  logger.error({ msg: 'Failed to start server', error });
});