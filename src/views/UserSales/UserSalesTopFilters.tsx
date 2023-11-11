import React from "react";

import { BaseButton, BaseSelect } from "components/common";
import { COLOR_OPTIONS } from "constants/index";

interface UserSalesTopFiltersProps {
  color: COLOR_OPTIONS;
  onSetColor: (color: COLOR_OPTIONS) => void;
}

const colorOptions = [
  { value: COLOR_OPTIONS.ALL, label: "All" },
  { value: COLOR_OPTIONS.RED, label: "Red" },
  { value: COLOR_OPTIONS.WHITE, label: "White" },
];

export function UserSalesTopFilters({ onSetColor, color }: UserSalesTopFiltersProps) {
  return (
    <div className="marketplace__top-filters">
      <BaseSelect
        isContained
        className="d-md-none"
        options={colorOptions}
        onOptionChange={({ value }) => onSetColor(value)}
      />
      <BaseButton
        className="d-none d-md-flex"
        size="small"
        color={color === COLOR_OPTIONS.RED ? "white" : "gray"}
        theme={`${color === COLOR_OPTIONS.RED ? "contained" : "outlined"} rounded`}
        click={() => onSetColor(COLOR_OPTIONS.RED)}
      >
        Red
      </BaseButton>
      <BaseButton
        className="d-none d-md-flex"
        size="small"
        color={color === COLOR_OPTIONS.WHITE ? "white" : "gray"}
        theme={`${color === COLOR_OPTIONS.WHITE ? "contained" : "outlined"} rounded`}
        click={() => onSetColor(COLOR_OPTIONS.WHITE)}
      >
        White
      </BaseButton>
      <BaseButton
        className="d-none d-md-flex"
        size="small"
        color={color === COLOR_OPTIONS.ALL ? "white" : "gray"}
        theme={`${color === COLOR_OPTIONS.ALL ? "contained" : "outlined"} rounded`}
        click={() => onSetColor(COLOR_OPTIONS.ALL)}
      >
        All
      </BaseButton>
    </div>
  );
}
