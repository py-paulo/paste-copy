import WebSocket from "ws";

/*
* Interface que representa uma sala de chat, com uma lista de conexões,
* a ultima menssagem enviada e a lista de usuários conectados.
*/
export interface Room {
  [roomName: string]: {
    users: {
      [ip: string]: {
        username: string;
        uuid: string;
        connection: WebSocket;
      };
    }
    lastNote: string;
  }
}