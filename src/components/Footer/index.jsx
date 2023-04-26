import "./style.css";
const Footer = () => {
  return (
    <footer className="footer">
      <nav className="nav">
        <ul className="nav-ul">
          <li className="nav-ul--li">
            <p>F1</p>
            <p> Help</p>
          </li>
          <li className="nav-ul--li">
            <p>F2</p>
            <p> Save</p>
          </li>
          <li className="nav-ul--li">
            <p>F3</p>
            <p> Open</p>
          </li>
          <li className="nav-ul--li">
            <p>Alt-F9</p>
            <p> Compile</p>
          </li>
          <li className="nav-ul--li">
            <p>F9</p>
            <p> Make</p>
          </li>
          <li className="nav-ul--li">
            <p>F10</p>
            <p> Menu</p>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
