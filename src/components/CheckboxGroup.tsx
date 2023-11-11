import React from "react";
import { Checkbox } from "./common";

interface CheckboxGroupProps {
  options?: FilterSelectValueType[];
  values: string[];
  onSelectOptions: (values: string[]) => void;
}

export function CheckboxGroup({
  options = [],
  values,
  onSelectOptions,
}: CheckboxGroupProps): JSX.Element {
  return (
    <>
      {options.map(({ value, count }) => {
        if (!+count) return null;

        return (
          <div className="filters__check-row" key={`${value}_${count}`}>
            <Checkbox id={value} checked={isChecked(value)} onChange={handleChange} label={value} />
            <span className="filters__count">{count}</span>
          </div>
        );
      })}
    </>
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let newOptionValues: string[] = [...values];
    const { id } = event.target;
    const optionId = newOptionValues.find((option) => option === id);

    if (optionId) {
      newOptionValues = newOptionValues.filter((option) => option !== id);
    } else {
      newOptionValues.push(id);
    }
    onSelectOptions(newOptionValues);
  }

  function isChecked(item: string) {
    return values.includes(item);
  }
}
