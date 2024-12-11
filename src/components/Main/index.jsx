import React, { useEffect, useRef, useState } from "react";
import throttle from "lodash.throttle";
import useWebSocket from "react-use-websocket";
import "./style.css";

const Main = ({ username, note }) => {
  const WS_URL = `ws://127.0.0.1:8000/${note}`;

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    queryParams: { username },
    share: true,
  });

  const THROTTLE = 50;
  const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE));

  const [myText, setMyText] = useState("");
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (lastJsonMessage) {
      textareaRef.current.value = lastJsonMessage.text;
    }
  }, [lastJsonMessage]);

  const handleTextareaChange = (e) => {
    const text = e.target.value;
    setMyText(text);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log("sending message:", text);
      sendJsonMessageThrottled.current({
        username,
        text,
        datatime: new Date().toISOString(),
      });
    }, 1000);
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
          <div className="painel-header---title">{note}.CPP</div>
          <div className="painel-header--border---right" />
        </div>
        <div className="painel-main">
          <textarea
            id="editor"
            cols="30"
            rows="10"
            className="painel-main--input"
            onChange={handleTextareaChange}
            ref={textareaRef}
            value={myText}
          />
        </div>
        <div className="painel-footer">
          <div className="painel-footer--border" />
        </div>
      </div>
    </main>
  );
};

export default Main;