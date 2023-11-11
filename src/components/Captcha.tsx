import React, { FC, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";

import { useRootStore } from "context/RootStoreProvider";
import { AuthService } from "stores/Auth/auth.service";

type CaptchaProps = {
  submitForm: () => void;
};

const Captcha: FC<CaptchaProps> = observer(({ submitForm }) => {
  const geetest = useRef(null);
  const { authStore } = useRootStore();

  useEffect(() => {
    return () => {
      window.GEETEST_LOADED = false;
      if (window.GTest) {
        window.GTest.reset();
      }
      const script = document.getElementById(scriptId);
      if (script) {
        script.remove();
      }
    };
  }, []);

  const scriptId = "#geetestScript";
  const geetestScript = document.getElementById(scriptId);

  if (geetestScript) return null;

  const script = document.createElement("script");

  script.src = `${process.env.PUBLIC_URL}/geetest.min.js`;
  script.id = scriptId;
  script.async = true;
  script.onload = () => {
    window.GEETEST_LOADED = true;

    init();
  };

  document.body.appendChild(script);

  const init = async () => {
    if (!window.GEETEST_LOADED || !geetest) {
      return;
    }

    const { response } = await AuthService.getGeetest();
    const geetestWrapId = "#geetest-captcha";

    window.initGeetest(
      {
        gt: response?.gt,
        challenge: response?.challenge,
        offline: !response?.success,
        new_captcha: response?.new_captcha,
        product: "bind",
        lang: "en",
        http: `${process.env.NODE_ENV === "production" ? "https" : "http"}://`,
      },
      (captcha) => {
        window.GTest = captcha;
        authStore.setCaptchaLoaded(true);

        const wrap = document.querySelector(geetestWrapId);

        if (wrap) {
          wrap.innerHTML = "";
        }

        captcha.onSuccess(() => {
          submitForm();
        });
      },
    );
  };

  return (
    <div>
      <div id="geetest-captcha" ref={geetest} />
    </div>
  );
});

export default Captcha;
