import React from "react";

import { BaseButton, BaseSelect } from "components/common";
import { TYPE_OPTIONS } from "constants/index";

interface FollowersTopFiltersProps {
  type: TYPE_OPTIONS;
  onSetType: (type: TYPE_OPTIONS) => void;
}

const typeOptions = [
  { value: TYPE_OPTIONS.ALL, label: "Все" },
  { value: TYPE_OPTIONS.NEW, label: "Новые" },
];

export function FollowersTopFilters({ onSetType, type }: FollowersTopFiltersProps) {
  return (
    <div className="d-flex align-items-center">
      <BaseSelect
        isContained
        className="d-md-none"
        options={typeOptions}
        onOptionChange={({ value }) => onSetType(value)}
      />
      <BaseButton
        className="d-none d-md-flex"
        size="small"
        color={type === TYPE_OPTIONS.NEW ? "white" : "gray"}
        theme={`${type === TYPE_OPTIONS.NEW ? "contained" : "outlined"} rounded`}
        click={() => onSetType(TYPE_OPTIONS.NEW)}
      >
        Новые
      </BaseButton>
      <BaseButton
        className="d-none d-md-flex"
        size="small"
        color={type === TYPE_OPTIONS.ALL ? "white" : "gray"}
        theme={`${type === TYPE_OPTIONS.ALL ? "contained" : "outlined"} rounded`}
        click={() => onSetType(TYPE_OPTIONS.ALL)}
      >
        Все
      </BaseButton>
    </div>
  );
}
