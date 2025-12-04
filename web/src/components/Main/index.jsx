import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import "./style.css";

const Main = ({ username, note }) => {
  const WS_URL = `ws://127.0.0.1:8000/${note}`;

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    queryParams: { username },
    share: true,
  });

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll para a última mensagem quando novas mensagens chegarem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Processar mensagens recebidas (histórico ou nova mensagem)
  useEffect(() => {
    if (!lastJsonMessage) return;

    // Verificar se é um histórico completo
    if (lastJsonMessage.type === 'history' && lastJsonMessage.messages) {
      // Substituir todas as mensagens pelo histórico
      setMessages(lastJsonMessage.messages);
      return;
    }

    // Se for uma mensagem normal
    if (lastJsonMessage.text) {
      setMessages((prevMessages) => {
        // Verificar se a mensagem já existe (evitar duplicatas)
        const messageExists = prevMessages.some(
          (msg) =>
            msg.username === lastJsonMessage.username &&
            msg.text === lastJsonMessage.text &&
            msg.datatime === lastJsonMessage.datatime
        );

        if (!messageExists) {
          return [...prevMessages, lastJsonMessage];
        }
        return prevMessages;
      });
    }
  }, [lastJsonMessage]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    const messageData = {
      username,
      text: inputMessage.trim(),
      datatime: new Date().toISOString(),
    };

    // Adicionar mensagem localmente imediatamente
    setMessages((prevMessages) => [...prevMessages, messageData]);

    // Enviar mensagem via WebSocket
    sendJsonMessage(messageData);

    // Limpar input
    setInputMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (datatime) => {
    if (!datatime) return "";
    const date = new Date(datatime);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="main">
      <div className="painel">
        <div className="painel-header">
          <div className="painel-header--border---left">
            <span className="icon-border">
              <span>[</span>
              <span className="icon-border-inside"></span>
              <span>]</span>
            </span>
          </div>
          <div className="painel-header---title">{note || "CHAT"}.MSG</div>
          <div className="painel-header--border---right" />
        </div>
        <div className="painel-main chat-container">
          <div className="chat-messages" ref={messagesContainerRef}>
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>Nenhuma mensagem ainda. Seja o primeiro a escrever!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.username}-${message.datatime}-${index}`}
                  className={`chat-message ${
                    message.username === username ? "chat-message--own" : ""
                  }`}
                >
                  <div className="chat-message-header">
                    <span className="chat-message-username">
                      {message.username}
                    </span>
                    <span className="chat-message-time">
                      {formatTime(message.datatime)}
                    </span>
                  </div>
                  <div className="chat-message-text">{message.text}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Digite sua mensagem e pressione Enter..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <button type="submit" className="chat-send-button">
              &gt;
            </button>
          </form>
        </div>
        <div className="painel-footer">
          <div className="painel-footer--border" />
        </div>
      </div>
    </main>
  );
};

export default Main;