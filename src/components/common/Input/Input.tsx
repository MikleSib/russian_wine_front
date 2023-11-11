import React, { FC, useState } from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";

import { ReactComponent as EyeIcon } from "assets/icons/eye.svg";
import { ReactComponent as EyeSlashIcon } from "assets/icons/eye-slash.svg";
import { useRootStore } from "context/RootStoreProvider";
import { Form } from "stores/Form";
import "./Input.styles.scss";

type BaseInputProps = {
  name: string;
  formKey: string;
  storeKey: string;
  type?: string;
  label?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  disablePaste?: boolean;
  isPassword?: boolean;
  noValidate?: boolean;
  noTrim?: boolean;
  onBlur?: (field: string, value: string) => any;
  onFieldChange?: (field: string, value: string) => void;
};

const BaseInput: FC<BaseInputProps> = observer(
  ({
    name,
    formKey,
    storeKey,
    type = "text",
    className,
    placeholder,
    disabled = false,
    disablePaste = false,
    isPassword = false,
    noValidate = false,
    noTrim = false,
    onBlur,
    label = false,
    onFieldChange,
  }) => {
    const [showPass, toggleShowPass] = useState(false);

    const rootStore = useRootStore();
    const store = rootStore[storeKey as keyof typeof rootStore];
    const form = store[formKey as keyof typeof store] as Form;

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
      if (disablePaste) {
        event.preventDefault();

        if (isPassword) {
          // Notify.warning("Password should be typed");
        }
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
      form.onBlur({
        field: name,
        noValidate,
      });

      if (onBlur) {
        onBlur(name, noTrim ? event.target.value : event.target.value.trim());
      }
    };

    const handleChange = (name: string) => {
      return (event: React.ChangeEvent<HTMLInputElement>): void => {
        const value = noTrim ? event.target.value : event.target.value.trim();
        form.changeField({
          field: name,
          value,
        });

        if (onFieldChange) {
          onFieldChange(name, value);
        }
      };
    };

    return (
      <div className={clsx("baseInput", className, { "baseInput--disabled": disabled })}>
        <div className="baseInput__wrap">
          {label && <div className="baseInput__label">{label}</div>}
          <input
            className={clsx("baseInput__input", { "baseInput__input--error": form.getError(name) })}
            type={isPassword && !showPass ? "password" : type}
            name={name}
            value={form.getField(name)}
            disabled={disabled}
            placeholder={placeholder}
            onPaste={handlePaste}
            onBlur={handleBlur}
            onChange={handleChange(name)}
          />
          {isPassword && (
            <div className="baseInput__icon-btn" onClick={() => toggleShowPass(!showPass)}>
              {showPass ? <EyeSlashIcon /> : <EyeIcon />}
            </div>
          )}
        </div>
        <div className="baseInput__error">{form.getError(name)}</div>
      </div>
    );
  },
);

export default BaseInput;
