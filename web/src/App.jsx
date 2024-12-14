import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Main from "./components/Main";

import { useParams } from "react-router";

function App() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('username');
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
