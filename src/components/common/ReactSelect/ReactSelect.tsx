import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import Select, { SingleValue } from "react-select";

import { useRootStore } from "context/RootStoreProvider";
import { Form } from "stores/Form";
import "./ReactSelect.styles.scss";

type OptionType = Record<string, any>;
type OptionsType = Array<OptionType>;

interface ReactSelectProps {
  name: string;
  formKey: string;
  storeKey: string;
  label?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  options: OptionsType;
  multiple?: boolean;
  autocomplete?: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

function ReactSelect({
  name,
  formKey,
  storeKey,
  className,
  placeholder,
  label,
  options,
  multiple = false,
  autocomplete = false,
  disabled,
  onFieldChange,
}: ReactSelectProps) {
  const rootStore = useRootStore();
  const store = rootStore[storeKey as keyof typeof rootStore];
  const form = store[formKey as keyof typeof store] as Form;

  const selectedOption = useMemo(() => {
    return options.find(({ value }) => value === form.getField(name));
  }, [options, form.getField(name)]);

  return (
    <div className={clsx("react-select", className, { "is-error": Boolean(form.getError(name)) })}>
      <div className="react-select__wrap">
        {label && <div className="react-select__label">{label}</div>}
        <Select
          options={options}
          isClearable={false}
          isSearchable={autocomplete}
          className="react-select__container"
          classNamePrefix="react-select"
          placeholder={placeholder}
          components={{ IndicatorSeparator: () => null }}
          onChange={handleChange}
          value={selectedOption}
          isMulti={multiple}
          filterOption={
            autocomplete
              ? ({ data }, value) => data.search.toLowerCase().includes(value)
              : undefined
          }
          isDisabled={disabled}
        />
      </div>
      <div className="react-select__error">{form.getError(name)}</div>
    </div>
  );

  function handleChange(newValue: SingleValue<OptionType>) {
    form.changeField({
      field: name,
      value: newValue?.value ?? "",
      validate: true,
    });
    if (onFieldChange) {
      onFieldChange(name, newValue?.value ?? "");
    }
  }
}

export default observer(ReactSelect);
