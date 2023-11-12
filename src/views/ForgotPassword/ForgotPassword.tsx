import React, { FC, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";

import { AuthFormWrapper, PageMeta } from "components";
import { BaseLink, BaseButton, BaseInput } from "components/common";
import { useRootStore } from "context/RootStoreProvider";
import { routes } from "utils/router";

import "./ForgotPassword.styles.scss";
import ReCAPTCHA from "react-google-recaptcha";
// import api from "services/api/api";
// import { CancelToken } from "apisauce";

const ForgotPassword: FC = observer(() => {
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
  const validateOnly: string[] = ["email"];
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
  };

  // function onChange(value: string | null) {
  //   console.log("Captcha value:", value);
  //   handleSubmitForm();
  // }

  return (
    <>
      <PageMeta />
      <div className="forgot-password">
        <AuthFormWrapper
          title={
            authStore.successScreen && !authStore.authForm.hasError
              ? "Отправленное письмо"
              : "Восстановление пароля"
          }
        >
          <p
            className={clsx("forgot-password__text", {
              "forgot-password__text--gray": authStore.successScreen,
            })}
          >
            {authStore.successScreen
              ? authStore.authForm.hasError
                ? "Пользователь с этим адресом электронной почты не зарегистрирован"
                : "Инструкция по восстановлению пароля была отправлена на ваш e-mail"
              : "Введите свой адрес электронной почты, чтобы получить инструкцию по восстановлению пароля"}
          </p>
          {authStore.authForm.hasError && (
            <BaseButton
              className="forgot-password__submit mb-0"
              size="large"
              click={() => navigate(routes.register.path)}
            >
              Регистрация
            </BaseButton>
          )}
          {!authStore.successScreen && (
            <>
              <form className="forgot-password__form" noValidate onSubmit={handleClickSubmitButton}>
                <BaseInput
                  name="email"
                  placeholder="E-mail"
                  formKey="authForm"
                  storeKey="authStore"
                />
                {/* {window.CAPTCHA_ENABLED && (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    size="invisible"
                    sitekey="6Lc0mhgkAAAAAP_7Wj1S72rJOkc21WiUneknYrtr"
                    // onChange={onChange}
                  />
                )} */}
                <BaseButton
                  className="forgot-password__submit"
                  size="large"
                  disabled={!isValid}
                  type="submit"
                  loading={authStore.authForm.loading}
                >
                  Отправить
                </BaseButton>
              </form>
              <BaseLink className="forgot-password__forgot-link" path={routes.login.path}>
                Вернуться обратно
              </BaseLink>
            </>
          )}
        </AuthFormWrapper>
      </div>
    </>
  );
});

export default ForgotPassword;
