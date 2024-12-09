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

  const textareaRef = useRef(null);

  useEffect(() => {
    if (lastJsonMessage) {
      let latestMessage = null;

      Object.keys(lastJsonMessage).forEach((uuid) => {
        const data = lastJsonMessage[uuid];
        const datatime = new Date(data.state.datatime);

        if (!latestMessage || datatime > new Date(latestMessage.state.datatime)) {
          latestMessage = data;
        }
      });

      if (latestMessage) {
        textareaRef.current.value = latestMessage.state.text;
      }
    }
  }, [lastJsonMessage]);

  const handleTextareaChange = (e) => {
    const text = e.target.value;
    sendJsonMessageThrottled.current({
      username,
      text,
      datatime: new Date().toISOString(),
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
          <div className="painel-header---title">{note}.CPP</div>
          <div className="painel-header--border---right" />
        </div>
        <div className="painel-main">
          <textarea
            name=""
            id="editor"
            cols="30"
            rows="10"
            className="painel-main--input"
            onKeyUpCapture={handleTextareaChange}
            ref={textareaRef}
          >
          </textarea>
        </div>
        <div className="painel-footer">
          <div className="painel-footer--border" />
        </div>
      </div>
    </main>
  );
};

export default Main;
