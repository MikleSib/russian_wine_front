import { useEffect } from "react";
import "./FacebookAuth.styles.scss";
// @ts-ignore
import FacebookLogin from "react-facebook-login";
import { ReactComponent as FacebookIcon } from "assets/icons/facebook.svg";

const FacebookAuth = () => {
  const responseFacebook = (response: any) => {
    console.log(response);
  };
  return (
    <div className="facebook_auth_btn">
      <FacebookLogin
        appId={"998491981363094"}
        callback={responseFacebook}
        icon={<FacebookIcon />}
      />
    </div>
  );
};

export default FacebookAuth;
