import React from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import PhoneInput, { CountryData } from "react-phone-input-2";

import { useRootStore } from "context/RootStoreProvider";
import { Form } from "stores/Form";

import "./PhoneNumberInput.styles.scss";

interface PhoneNumberInputProps {
  name: string;
  label?: string;
  formKey: string;
  storeKey: string;
  defaultCountry?: string;
  className?: string;
}

function PhoneNumberInput({
  name,
  label,
  storeKey,
  formKey,
  defaultCountry = "us",
  className,
}: PhoneNumberInputProps) {
  const rootStore = useRootStore();
  const store = rootStore[storeKey as keyof typeof rootStore];
  const form = store[formKey as keyof typeof store] as Form;

  return (
    <div className={clsx("phone-number", className, { "is-error": Boolean(form.getError(name)) })}>
      <div className="phone-number__wrap">
        {label && <div className="phone-number__label">{label}</div>}
        <PhoneInput
          country={defaultCountry}
          value={form.getField(name)}
          onChange={handleChange}
          placeholder=""
          enableAreaCodes
        />
      </div>
      <div className="phone-number__error">{form.getError(name)}</div>
    </div>
  );

  function handleChange(value: string, country: CountryData) {
    form.changeField({
      field: name,
      value,
    });

    if (!value || value === "+") {
      form.setErrors({ [name]: ["Field is required"] });
    } else if (!value?.replace(/[\s()]/g, "").startsWith(`${country?.dialCode}`)) {
      form.setErrors({ [name]: ["Invalid phone number format"] });
    } else if (form.getError(name)) {
      form.clearErrors(name);
    }
  }
}

export default observer(PhoneNumberInput);
