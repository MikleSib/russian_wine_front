import React, { FC } from "react";

import logoMobileSrc from "assets/images/logo-fruit.svg";
import "./AuthFormWrapper.styles.scss";

type AuthFormWrapperProps = {
  title: string;
};

const AuthFormWrapper: FC<AuthFormWrapperProps> = ({ title, children }) => {
  return (
    <div className="authFormWrap">
      <div className="authFormWrap__image-block">
        <img className="authFormWrap__image" src={logoMobileSrc} alt="winessy-logo" />
      </div>
      <h2 className="authFormWrap__title">{title}</h2>
      {children}
    </div>
  );
};

export default AuthFormWrapper;
