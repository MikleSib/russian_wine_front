import React, { FC, memo } from "react";
import clsx from "clsx";

import "./Button.styles.scss";

type ButtonProps = {
  type?: "submit" | "button";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  click?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  size?: "small" | "medium" | "large";
  theme?: string; // etc. "contained" | "outlined" | "rounded"
  color?: "black" | "gray" | "white" | "red";
};
const Button: FC<ButtonProps> = memo(
  ({
    type = "button",
    click,
    loading = false,
    disabled = false,
    color = "white",
    theme = "contained",
    size = "medium",
    className,
    children,
    fullWidth,
  }) => {
    const themeArray = theme.split(" ").map((t) => `baseButton--${t}`);
    const btnClasses = clsx(
      "baseButton",
      `baseButton--${size}`,
      `baseButton--${color}`,
      themeArray,
      className,
      {
        "baseButton--disabled": disabled || loading,
        "baseButton--full-width": fullWidth,
      },
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      if (disabled) return;
      click && click(event);
    };

    return (
      <button
        type={type}
        className={btnClasses}
        disabled={loading || disabled}
        onClick={handleClick}
      >
        <div className="baseButton__content">{loading ? "Loading" : children}</div>
      </button>
    );
  },
);

export default Button;
