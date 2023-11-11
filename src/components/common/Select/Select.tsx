import React, { FC, memo, useEffect, useState } from "react";
import clsx from "clsx";

import { ReactComponent as CheckIcon } from "assets/icons/check.svg";
import "./Select.styles.scss";

type OptionType = {
  label: string;
  value: any;
};
type SelectProps = {
  options: OptionType[];
  onOptionChange?: (option: OptionType) => void;
  defaultOptionIndex?: number;
  className?: string;
  isContained?: boolean;
};

const Select: FC<SelectProps> = memo(
  ({ options, onOptionChange, defaultOptionIndex = 0, className, isContained = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(defaultOptionIndex);

    useEffect(() => {
      const handleClickOutside = () => {
        setIsOpen(false);
      };

      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, []);

    const toggling = (event: React.MouseEvent<HTMLDivElement>): void => {
      setIsOpen(!isOpen);
      event.stopPropagation();
    };

    const onOptionClicked = (selectedIndex: number) => (): void => {
      setSelectedOptionIndex(selectedIndex);
      setIsOpen(false);

      if (onOptionChange) {
        onOptionChange(options[selectedIndex]);
      }
    };

    return (
      <div
        className={clsx("select__container", className, {
          "select__container--open": isOpen,
          "select__container--contained": isContained,
        })}
      >
        <div className="select__header" onClick={toggling}>
          {options[selectedOptionIndex].label}
          <div className="select__arrow" />
        </div>
        <div className="select__dropdown">
          <ul className="select__list">
            {options.map((option, index) => (
              <li
                className={clsx("select__list-item", {
                  "select__list-item--active": selectedOptionIndex === index,
                })}
                onClick={onOptionClicked(index)}
                key={option.value}
              >
                <span className="select__list-check">
                  <CheckIcon />
                </span>
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);

export default Select;
