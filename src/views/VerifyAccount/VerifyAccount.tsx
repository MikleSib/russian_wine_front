import React, { FC, useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthFormWrapper, PageMeta } from "components";
import { BaseButton } from "components/common";
import { useRootStore } from "context/RootStoreProvider";
import { routes } from "utils/router";

import "./VerifyAccount.styles.scss";

const VerifyAccount: FC = observer(() => {
  const { authStore } = useRootStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (!params.get("token")) {
      handleClickButton();
    } else {
      authStore.verifyAccount(params.get("token") ?? "");
    }
  }, []);

  const handleClickButton = useCallback(() => {
    navigate(routes.login.path);
  }, []);

  return (
    <>
      <PageMeta />
      <div className="verify">
        <AuthFormWrapper title="Registration successful">
          <p className="verify__text">
            Registration is successful. You can log in to your account.
          </p>
          <BaseButton
            className="verify__button"
            size="large"
            click={handleClickButton}
            loading={authStore.authForm.loading}
          >
            Log in
          </BaseButton>
        </AuthFormWrapper>
      </div>
    </>
  );
});

export default VerifyAccount;
