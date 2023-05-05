import { useState } from "react";
import "./style.css";

const Header = () => {
  // guardar o estado de ativação da opção Edit
  const [btnEdit, setBtnEdit] = useState(false);

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
          <li className="nav-ul---li" onClick={() => setBtnEdit(!btnEdit)}>
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

      {/* opcões do Edit, ativo apenas quando o usuário clicar na opção  */}
      <div className="divEdit" style={{ display: btnEdit ? "block" : "none" }}>
        <ul className="divEdit-ul group-1">
          <li className="divEdit-ul--li">
            <p>Undo</p>

            <p className="atalho">Alt+BkSp</p>
          </li>
          <li className="divEdit-ul--li">Redo</li>
        </ul>

        <ul className="divEdit-ul group-2">
          <li className="divEdit-ul--li">
            {" "}
            <p>Cut </p> <p className="atalho">Shift+Del </p>{" "}
          </li>
          <li className="divEdit-ul--li">
            <p>Copy</p>

            <p className="atalho">Ctrl+Ins</p>
          </li>
          <li className="divEdit-ul--li">
            <p>Paste</p>

            <p className="atalho">Shift+Ins</p>
          </li>
          <li className="divEdit-ul--li">
            <p>Clear</p>
            <p className="atalho">Ctrl+Del</p>
          </li>

          <li className="divEdit-ul--li">
            <span>S</span>
            how clipboard
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
