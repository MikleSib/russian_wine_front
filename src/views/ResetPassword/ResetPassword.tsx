import React, { FC, useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import { AuthFormWrapper, PageMeta } from "components";
import { BaseButton, BaseInput } from "components/common";
import { useRootStore } from "context/RootStoreProvider";
import { routes } from "utils/router";

import "./ResetPassword.styles.scss";

const ResetPassword: FC = observer(() => {
  const { authStore } = useRootStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();

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

  const validateOnly: string[] = ["email", "password", "repeatPassword"];
  const isValid = authStore.authForm.isValid(validateOnly);

  const handleSubmitForm = (event?: React.FormEvent<HTMLFormElement>): void => {
    event && event.preventDefault();

    authStore.authForm.submit({
      payload: { pathname, token: params.get("token") ?? "" },
      meta: { validateOnly },
    });
  };

  const handleClickButton = useCallback(() => {
    navigate(routes.login.path);
  }, []);

  return (
    <>
      <PageMeta />
      <div className="reset-password">
        <AuthFormWrapper title={authStore.successScreen ? "Пароль изменен" : "Новый пароль"}>
          {authStore.successScreen ? (
            <>
              <p className="reset-password__success-text">
                Ваш пароль был успешно изменен. Вы можете войти в систему
              </p>
              <BaseButton
                className="reset-password__submit"
                size="large"
                click={handleClickButton}
                loading={authStore.authForm.loading}
              >
                Авторизоваться
              </BaseButton>
            </>
          ) : (
            <>
              <form className="reset-password__form" noValidate onSubmit={handleSubmitForm}>
                <BaseInput
                  name="email"
                  placeholder="E-mail"
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
                  className="mb-0"
                />
                <div className="reset-password__errorForm">
                  {authStore.authForm.getError("form")}
                </div>
                <BaseButton
                  className="reset-password__submit"
                  size="large"
                  disabled={!isValid}
                  type="submit"
                  loading={authStore.authForm.loading}
                >
                  Отправить
                </BaseButton>
              </form>
            </>
          )}
        </AuthFormWrapper>
      </div>
    </>
  );
});

export default ResetPassword;
