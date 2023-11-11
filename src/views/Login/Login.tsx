import React, { FC, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useLocation } from "react-router-dom";

import { AuthFormWrapper, PageMeta } from "components";
import { BaseLink, BaseButton, BaseInput } from "components/common";
import { useRootStore } from "context/RootStoreProvider";
import { routes } from "utils/router";

import "./Login.styles.scss";
import ReCAPTCHA from "react-google-recaptcha";
import ReactGA from "react-ga4";
import GoogleAuth from "components/GoogleAuth/GoogleAuth";
import FacebookAuth from "components/FacebookAuth/FacebookAuth";
// import api from "services/api/api";
// import { CancelToken } from "apisauce";

//TODO: add reCaptchaKey 6Lc0mhgkAAAAAP_7Wj1S72rJOkc21WiUneknYrtr to process.env.REACT_APP_SITE_KEY
//TODO: add check recaptcha token in backend
const Login: FC = observer(() => {
  const { authStore } = useRootStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // const source = CancelToken.source();
  useEffect(() => {
    return () => {
      authStore.authForm.resetForm({ clearFields: true });
    };
  }, []);

  useEffect(() => {
    if (authStore.isLogined) {
      navigate(routes.marketplace.path);
    }
  }, [authStore.isLogined]);

  // const loadingCaptcha: boolean = window.CAPTCHA_ENABLED && !authStore.captchaLoaded;
  const validateOnly: string[] = ["email", "password"];
  const isValid = authStore.authForm.isValid(validateOnly);
  const fieldsIsEmpty = !validateOnly
    .map((field) => authStore.authForm.getField(field))
    .some(Boolean);
  const disabledCaptcha: boolean = fieldsIsEmpty || !isValid;

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [captchaVerifying, setCaptchaVerifying] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  const handleClickSubmitButton = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    // setCaptchaVerifying(true);

    // if (!disabledCaptcha && window.CAPTCHA_ENABLED) {
    //   if (recaptchaRef.current) {
    //     const token = await recaptchaRef.current.executeAsync();
    //     recaptchaRef.current.reset();
    //     console.log(token);
    //     if (token) {
    //       handleSubmitForm();
    //       // const secretKek = "6Lc0mhgkAAAAAKuTtdqtOOcEL43xtLdCTv9oIkBh";
    //       // const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKek}&response=${token}`;
    //       // await api
    //       //   .post(url, {}, { cancelToken: source.token })
    //       //   .then((res) => {
    //       //     console.log(res);
    //       //     if (res !== null) {
    //       //       handleSubmitForm();
    //       //     }
    //       //     setCaptchaVerifying(false);
    //       //   })
    //       //   .catch((error) => {
    //       //     console.log(error);
    //       //     setCaptchaVerifying(false);
    //       //   });
    //     }
    //   }
    // } else {
    // }
    handleSubmitForm();
  };

  const handleSubmitForm = (event?: React.FormEvent<HTMLFormElement>): void => {
    event && event.preventDefault();

    authStore.authForm.submit({
      payload: { pathname },
      meta: { validateOnly },
    });

    ReactGA.event("login");
  };

  // function onChange(value: string | null) {
  //   console.log("Captcha value:", value);
  //   if (value) {
  //     setIsCaptchaVerified(true);
  //   }
  //   // handleSubmitForm();
  // }

  return (
    <>
      <PageMeta />
      <div className="login">
        <AuthFormWrapper title="Authorization">
          <GoogleAuth />
          <FacebookAuth />
          <form className="login__form" noValidate onSubmit={handleClickSubmitButton}>
            <BaseInput name="email" placeholder="E-mail" formKey="authForm" storeKey="authStore" />
            <BaseInput
              name="password"
              placeholder="Password"
              isPassword
              formKey="authForm"
              storeKey="authStore"
            />
            <div className="login__errorForm">{authStore.authForm.getError("form")}</div>
            {/* {window.CAPTCHA_ENABLED && (
              <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible"
                sitekey="6Lc0mhgkAAAAAP_7Wj1S72rJOkc21WiUneknYrtr"
                // onChange={onChange}
              />
            )} */}
            <BaseButton
              className="login__submit"
              size="large"
              disabled={!isValid}
              type="submit"
              loading={authStore.authForm.loading}
            >
              Log in
            </BaseButton>
          </form>
          <BaseLink className="login__forgot-link" path={routes.forgotPassword.path}>
            Forgot password?
          </BaseLink>
        </AuthFormWrapper>
      </div>
    </>
  );
});

export default Login;
