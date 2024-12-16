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
  logger.info({ msg: `user '${user.username}' in room '${room}' disconnected`, user, room, status: 'disconnected' });

  delete rooms[room].connections[uuid];
  delete rooms[room].users[uuid];
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

  Object.keys(rooms[room].connections).forEach((uuid) => {
    const connection = rooms[room].connections[uuid];
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
const saveMessageToDatabase = async (mongoDb: Db, room: string, message: string, uuid: string) => {
  await mongoDb.collection(room).insertOne({ room, message, uuid });
};

const getLastMessageFromCache = async (redisClient: RedisClientType, room: string): Promise<string|undefined> => {
  const cacheKey = `room:${room}:messages`;
  try {
    // Obter o primeiro elemento da lista (mensagem mais recente)
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

const saveMessageToCache = async (redisClient: RedisClientType, room: string, message: string, uuid: string) => {
  const cacheKey = `room:${room}:messages`;
  const messageData = JSON.stringify({ message, uuid });

  // Adicionar a mensagem ao início da lista e limitar a lista a 100 mensagens
  try {
    // Adicionar a mensagem ao início da lista
    await redisClient.lPush(cacheKey, messageData);
    // Limitar a lista a 100 mensagens
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

  // Consumidor de mensagens para a fila
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { room, message, uuid } = JSON.parse(msg.content.toString());
      logger.trace({ msg: `received message from RabbitMQ`, room, message, uuid });

      // Salvar mensagem no banco de dados e no cache Redis
      await saveMessageToDatabase(mongoDb, room, message, uuid);
      await saveMessageToCache(redisClient, room, message, uuid);

      // Fazer broadcast da mensagem para todos os clientes conectados
      await broadcast(mongoDb, room);

      channel.ack(msg);
    }
  });
};

const setupWebSocketServer = async (mongoDb: Db, redisClient: RedisClientType) => {
  wsServer.on("connection", async (wsConnection, request) => {
    const { channel } = await connectToRabbitMQ();

    request.url = request.url || "";
    const room = (url.parse(request.url).pathname || "welcome").replace("/", "");
    const queryValues = url.parse(request.url, true).query;
    const username = getUsername(queryValues);

    console.log(request.socket.address());

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

    logger.info({ msg: `user '${username}:${uuid}' in room '${room}' connected`, user: username, room: room, uuid, status: 'connected' });

    if (!rooms[room]) rooms[room] = { connections: {}, lastNote: "", users: {} };

    rooms[room].connections[uuid] = wsConnection;
    rooms[room].users[uuid] = { username, uuid };

    /*
    * Buscar mensagem a partir do Redis.
    */
    const lastMessage = await getLastMessageFromCache(redisClient, room) || await getLastMessageFromDatabase(mongoDb, room);
    if (lastMessage) {
      wsConnection.send(JSON.stringify(JSON.parse(lastMessage).message));
    }

    const queue = 'chat_messages';
    await channel.assertQueue(queue, { durable: true });

    wsConnection.on("message", async (bytes) => {
      const message = JSON.parse(bytes.toString());
      logger.trace({ msg: `received message from websocket`, room, message, uuid });

      channel.sendToQueue(queue, Buffer.from(JSON.stringify({ room, message, uuid })), { persistent: true });
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