import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter, Routes, Route  } from "react-router";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/:hash" element={<App />} />
    </Routes>
  </BrowserRouter>
  /*
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  */
)
