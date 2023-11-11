import React from "react";

import logoMobileSrc from "assets/images/logo-fruit.svg";
import "./PageLoader.styles.scss";

export default function PageLoader(): JSX.Element {
  return (
    <div className="wrapper">
      <div className="wrapper__loader">
        <img src={logoMobileSrc} alt="logo" />
        <h5>Loading...</h5>
      </div>
    </div>
  );
}
