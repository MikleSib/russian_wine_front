import React, { FC, memo } from "react";

import "./Checkbox.styles.scss";

type CheckboxProps = {
  id: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  label?: string;
};

const Checkbox: FC<CheckboxProps> = memo(({ checked, onChange, id, label }) => {
  return (
    <div className="d-flex align-items-center">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="checkbox" />
      {label && (
        <label htmlFor={id} className="checkbox__label">
          {label}
        </label>
      )}
    </div>
  );
});

export default Checkbox;
