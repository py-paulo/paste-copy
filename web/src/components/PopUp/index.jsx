import "./style.css";

// eslint-disable-next-line react/prop-types, no-unused-vars
const PopUp = ({ btnHelp, setBtnHelp }) => {
  return (
    <div className="divPopUp" style={{ display: btnHelp ? "block" : "none" }}>
      <div className="divBorder">
        <h2 className="title">About</h2>

        <div className="info">
          <p> Turbo Pascal </p>

          <p>Version 7.1</p>

          <p> Copyright (c) 1983,97 by</p>

          <p>Borland International, Inc</p>

          <button className="btn" onClick={() => setBtnHelp(false)}>
            <span className="first-word">O</span>
            <span className="second-word">K</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
