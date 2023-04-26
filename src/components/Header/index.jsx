import "./style.css";

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        <ul className="nav-ul">
          <li className="nav-ul---li">File</li>
          <li className="nav-ul---li">Edit</li>
          <li className="nav-ul---li">Search</li>
          <li className="nav-ul---li">Run</li>
          <li className="nav-ul---li">Compile</li>
          <li className="nav-ul---li">Debug</li>
          <li className="nav-ul---li">Project</li>
          <li className="nav-ul---li">Options</li>
          <li className="nav-ul---li">Window</li>
          <li className="nav-ul---li">Help</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
