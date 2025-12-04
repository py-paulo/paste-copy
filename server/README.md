# Servidor

Backend da aplicação **Paste Copy**. Esse pacote contém todo o código e definições de infraestrutura necessário para que a aplicação frontend funcione corretamente.

## Arquitetura

Ao modelar a arquitetura desse sistema, definimos que seria estritamente necessário que atendesse a alguns critérios: **garantir a ordem de envio e recebimento das mensagens**, **alta disponibilidade da aplicação** e **eficiência na atualização das notas**. Para que isso se tornasse possível estamos utilizando uma banco de dados em cache, o [**Redis**](https://redis.io/), para que algumas informações de muitos acessos não onere o banco de dados. O [**RabbitMQ**](https://www.rabbitmq.com/) para permitir a comunicação assíncrona entre os clientes conectados com garantia de entrega, resiliência, ordenação de mensagens e o roteamento delas. Por fim um banco de dados não relacional, [**MongoDb**](https://www.mongodb.com/pt-br) para armazenar os textos com desempenho.

### Representação em UML

```
+-------------------+       +-------------------+
|                   |       |                   |
|  WebSocket Server |<----->|     RabbitMQ      |
|                   |       |                   |
+-------------------+       +-------------------+
         |                           |
         |                           |
         v                           v
+-------------------+       +-------------------+
|                   |       |                   |
|      Redis        |<----->|     MongoDB       |
|                   |       |                   |
+-------------------+       +-------------------+
```

```
WebSocket Client       WebSocket Server       RabbitMQ       Redis       MongoDB
      |                       |                   |            |            |
      |--- Connect ---------->|                   |            |            |
      |                       |                   |            |            |
      |--- Send Message ----->|                   |            |            |
      |                       |--- Publish ------>|            |            |
      |                       |                   |            |            |
      |                       |                   |--- Save -->|            |
      |                       |                   |            |            |
      |                       |                   |            |--- Save -->|
      |                       |                   |            |            |
      |                       |<--- Consume ------|            |            |
      |                       |                   |            |            |
      |<--- Broadcast --------|                   |            |            |
      |                       |                   |            |            |
```

## Como rodar localmente?

> [!IMPORTANT]
> Para executar essa aplicação é ncessário ter o **Docker**, `docker compose` e o **nodejs** instalado na máquina.

Primeiro é necessário subir uma instância do Redis, MongoDb e RabbitMQ, faremos isso a partir do arquivo `docker-compose.yml` que tem a definição de todos os recursos em questão, com um adicional de algumas interfaces web de gerênciamento, tando do MongoDb quanto do RabbitMQ.

```bash
docker compose up -d
```

Na sequência já podemos instalar as dependências e iniciar o servidor:

```bash
npm i
npm run dev
```