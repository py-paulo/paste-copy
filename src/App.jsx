import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Main from "./components/Main";

import { useParams } from "react-router";

export function generateUsername() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_ ';
  const minLength = 5;
  const maxLength = 8;
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  
  let username = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    username += characters[randomIndex];
  }
  
  return username;
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('username') || generateUsername();
  let { hash } = useParams();

  return (
    <div className="app">
      <Header />
      <Main username={username} note={hash} />
      <Footer />
    </div>
  );
}

export default App;
