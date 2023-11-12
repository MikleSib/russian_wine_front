import React, { FC, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";

//import { AuthFormWrapper, Captcha, PageMeta } from "components";
import { AuthFormWrapper, PageMeta } from "components";
//
import { BaseLink, BaseButton, BaseInput } from "components/common";
import { useRootStore } from "context/RootStoreProvider";
import { routes } from "utils/router";
import "./Register.styles.scss";
import ReCAPTCHA from "react-google-recaptcha";
import ReactGA from "react-ga4";
// import { CancelToken } from "apisauce";
// import api from "services/api/api";

const Register: FC = observer(() => {
  const { authStore } = useRootStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // const source = CancelToken.source();
  useEffect(() => {
    return () => {
      authStore.authForm.resetForm({ clearFields: true });
      authStore.toggleSuccessScreen(false);
    };
  }, []);

  useEffect(() => {
    if (authStore.isLogined) {
      navigate(routes.marketplace.path);
    }
  }, [authStore.isLogined]);

  // const loadingCaptcha: boolean = window.CAPTCHA_ENABLED && !authStore.captchaLoaded;
  const validateOnly: string[] = ["email", "nickname", "password", "repeatPassword"];
  const isValid = authStore.authForm.isValid(validateOnly);
  const fieldsIsEmpty = !validateOnly
    .map((field) => authStore.authForm.getField(field))
    .some(Boolean);
  const disabledCaptcha: boolean = fieldsIsEmpty || !isValid;

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [captchaVerifying, setCaptchaVerifying] = useState(false);

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

    ReactGA.event("sign_up");
  };

  // function onChange(value: string | null) {
  //   console.log("Captcha value:", value);
  //   handleSubmitForm();
  // }

  return (
    <>
      <PageMeta />
      <div className={clsx("register", { register__success: authStore.successScreen })}>
        <AuthFormWrapper title={authStore.successScreen ? "Письмо отправлено" : "Создать аккаунт"}>
          {authStore.successScreen ? (
            <p className="register__success-text">
              На ваш электронный адрес была отправлена ссылка для завершения регистрации
            </p>
          ) : (
            <>
              <form className="register__form" noValidate onSubmit={handleClickSubmitButton}>
                <BaseInput
                  name="email"
                  placeholder="E-mail"
                  formKey="authForm"
                  storeKey="authStore"
                />
                <BaseInput
                  name="nickname"
                  placeholder="Nickname"
                  formKey="authForm"
                  storeKey="authStore"
                />
                <BaseInput
                  name="password"
                  placeholder="Password"
                  isPassword
                  formKey="authForm"
                  storeKey="authStore"
                />
                <BaseInput
                  name="repeatPassword"
                  placeholder="Repeat password"
                  isPassword
                  formKey="authForm"
                  storeKey="authStore"
                />
                {/* <div className="register__form-terms">
                  Входя в систему или создавая учетную запись, вы соглашаетесь с{" "}
                  <BaseLink
                    path="https://drive.google.com/file/d/1InmB8nEUj515TYqNiqRmDZGTCCByrfy-/view"
                    external
                  >
                    Условия обслуживания
                  </BaseLink>{" "}
                  И{" "}
                  <BaseLink
                    path="https://drive.google.com/file/d/1NTyvkD2dKAmzZL7MRfby5DwV6wZK4bxo/view"
                    external
                  >
                    Политика конфиденциальности
                  </BaseLink>
                </div> */}
                {/* {window.CAPTCHA_ENABLED && (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    size="invisible"
                    sitekey="6Lc0mhgkAAAAAP_7Wj1S72rJOkc21WiUneknYrtr"
                    // onChange={onChange}
                  />
                )} */}
                <BaseButton
                  className="register__submit"
                  size="large"
                  disabled={!isValid}
                  type="submit"
                  loading={authStore.authForm.loading}
                >
                  Создать
                </BaseButton>
              </form>
              <BaseLink className="register__login-link" path={routes.login.path}>
                У меня есть аккаунт
              </BaseLink>
            </>
          )}
        </AuthFormWrapper>
      </div>
    </>
  );
});

export default Register;
