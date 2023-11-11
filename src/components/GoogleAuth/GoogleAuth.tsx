import { useEffect, useRef } from "react";
import "./GoogleAuth.styles.scss";
import { ReactComponent as GoogleIcon } from "assets/icons/google.svg";

const GoogleAuth = () => {
  const handleGoogleAuth = (resp: any) => {
    console.log(resp);
  };
  // google init
  useEffect(() => {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleGoogleAuth,
    });

    // adding google auth button
    const singUpButton = document.querySelector("#googleAuth");
    if (singUpButton) {
      // @ts-ignore
      google.accounts.id.renderButton(singUpButton, {
        size: "large",
        width: "100%",
        height: "42px",
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="google_auth_wrapper">
      <div id="googleAuth" />
      <button className="google_auth_btn">
        <GoogleIcon /> Login with Google
      </button>
    </div>
  );
};

export default GoogleAuth;
