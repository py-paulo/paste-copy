import "./style.css";
const Main = () => {
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
          <div className="painel-header---title">NONAME00.CPP</div>
          <div className="painel-header--border---right" />
        </div>
        <div className="painel-main">
          {" "}
          <textarea
            name=""
            id=""
            cols="30"
            rows="10"
            className="painel-main--input"
          ></textarea>
        </div>
        <div className="painel-footer">
          <div className="painel-footer--border" />
        </div>
      </div>
    </main>
  );
};

export default Main;
