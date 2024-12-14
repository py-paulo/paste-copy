import WebSocket from "ws";

/*
* Interfaces and types
*/
export interface Connections {
  [uuid: string]: WebSocket;
}

/*
* Interface que representa uma sala de chat, com uma lista de conexões,
* a ultima menssagem enviada e a lista de usuários conectados.
*/
export interface Room {
  [roomName: string]: {
    connections: Connections;
    lastNote: string;
    users: {
      [uuid: string]: {
        username: string;
        uuid: string;
      };
    };
  };
}