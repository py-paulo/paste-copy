import "./style.css";
const Footer = () => {
  return (
    <footer className="footer">
      <ul className="nav-ul">
        <li className="nav-ul--li">
          <span>F1</span>
          <p> Help</p>
        </li>
        <li className="nav-ul--li">
          <span>F2</span>
          <p> Save</p>
        </li>
        <li className="nav-ul--li">
          <span>F3</span>
          <p> Open</p>
        </li>
        <li className="nav-ul--li">
          <span>F10</span>
          <p> Menu</p>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
