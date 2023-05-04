import "./style.css";

const Header = () => {
  return (
    // tag header para mostrar que é o "cabeçario" da página
    <header className="header">
      {/* tag <nav> por ser o menu de navegação */}
      <nav className="nav">
        {/* para listar elementos sem necessariamente precisar estar em ordem, usamos a tag <ul>  */}
        <ul className="nav-ul">
          {/* dentro de uma tag <ul> ou <ol> precisamos adicionar as <li>  */}
          <li className="nav-ul---li">
            {/* coloquei essa tag <span> para poder estilizar a primeira palavra diferente das demais  */}
            <span className="first-word">F</span>
            ile
          </li>
          <li className="nav-ul---li">
            <span className="first-word">E</span>
            dit
          </li>
          <li className="nav-ul---li">
            <span className="first-word">S</span>
            earch
          </li>
          <li className="nav-ul---li">
            <span className="first-word">R</span>
            un
          </li>
          <li className="nav-ul---li">
            <span className="first-word">C</span>
            ompile
          </li>
          <li className="nav-ul---li">
            <span className="first-word">D</span>
            ebug
          </li>
          <li className="nav-ul---li">
            <span className="first-word">P</span>
            roject
          </li>
          <li className="nav-ul---li">
            <span className="first-word">O</span>
            ptions
          </li>
          <li className="nav-ul---li">
            <span className="first-word">W</span>
            indow
          </li>
          <li className="nav-ul---li">
            <span className="first-word">H</span>
            elp
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
