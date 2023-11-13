import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { BaseButton, BaseInput, Checkbox } from "components/common";
import { SUMSUB_STATUS } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import { AuthService } from "stores/Auth/auth.service";
import KYC from "./KYC";
import "./Personal.styles.scss";

function Personal() {
  const { authStore } = useRootStore();

  const [status, setStatus] = useState<null | SUMSUB_STATUS>(null);

  const [isPrivate, setIsPrivate] = useState(authStore.selfInformation.isKeepPrivate);

  const handleGetKycStatus = useCallback(async () => {
    try {
      const { response, errors } = await AuthService.getKycStatus();
      if (response && !errors) {
        setStatus(response?.[0] ?? null);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!authStore.selfInformation.isKycApproved) {
      handleGetKycStatus();
    }
  }, []);

  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    authStore.personalInfoForm.submit({});
  };

  return (
    <>
      <KYC
        isKysApproved={authStore.selfInformation.isKycApproved}
        isPending={status === SUMSUB_STATUS.PENDING}
        onGetKycStatusAction={handleGetKycStatus}
      />
      <div className="personal mx-auto">
        <h3 className="personal__title">Personal</h3>
        <form noValidate autoComplete="off" className="personal__form" onSubmit={handleSubmitForm}>
          <BaseInput
            label="Имя"
            name="firstName"
            storeKey="authStore"
            formKey="personalInfoForm"
          />
          <BaseInput
            label="Фамилия"
            name="lastName"
            storeKey="authStore"
            formKey="personalInfoForm"
          />
          <BaseInput
            label="Почта"
            name="email"
            storeKey="authStore"
            formKey="personalInfoForm"
            disabled
          />
          <BaseInput
            label="Никнейм"
            name="nickname"
            storeKey="authStore"
            formKey="personalInfoForm"
            disabled
          />
          <div className="personal__field-checkbox">
            <Checkbox
              id={"keepPrivateCheckbox"}
              checked={isPrivate}
              onChange={(event) => {
                setIsPrivate(event.target.checked);
                authStore.personalInfoForm.setFieldValue({
                  field: "keep_private",
                  value: event.target.checked,
                });
              }}
              label={"is keep private"}
            />
          </div>
          <div className="flex-fill">
            <div className="personal__field-label">Описание</div>
            <textarea
              className="personal__field-area"
              rows={8}
              defaultValue={authStore.personalInfoForm.getField("description")}
              onChange={(event) =>
                authStore.personalInfoForm.setFieldValue({
                  field: "description",
                  value: event.target.value,
                })
              }
            />
          </div>
          <BaseButton type="submit" size="large" className="mx-auto">
            Сохранить
          </BaseButton>
        </form>
      </div>
    </>
  );
}

export default observer(Personal);
