import React from "react";

import { BaseButton, BaseSelect } from "components/common";
import { routes } from "utils/router";
import { COLOR_OPTIONS, TYPE_OPTIONS } from "constants/index";

interface MarketPlaceTopFiltersProps {
  pathname: string;
  color: COLOR_OPTIONS;
  onSetColor: (color: COLOR_OPTIONS) => void;
  type: TYPE_OPTIONS;
  onSetType: (type: TYPE_OPTIONS) => void;
}

const colorOptions = [
  { value: COLOR_OPTIONS.ALL, label: "All" },
  { value: COLOR_OPTIONS.RED, label: "Red" },
  { value: COLOR_OPTIONS.WHITE, label: "White" },
];

const typeOptions = [
  { value: TYPE_OPTIONS.ALL, label: "All" },
  { value: TYPE_OPTIONS.TOP, label: "Top" },
  { value: TYPE_OPTIONS.NEW, label: "New" },
];

export function MarketPlaceTopFilters({
  pathname,
  onSetColor,
  color,
  type,
  onSetType,
}: MarketPlaceTopFiltersProps) {
  if (pathname === routes.newItems.path) return null;

  // TODO REFACTOR
  return (
    <div className="marketplace__top-filters">
      {pathname === routes.allWin.path ? (
        <>
          <BaseSelect
            isContained
            className="d-md-none"
            options={typeOptions}
            onOptionChange={({ value }) => onSetType(value)}
          />
          <BaseButton
            className="d-none d-md-flex"
            size="small"
            color={type === TYPE_OPTIONS.TOP ? "white" : "gray"}
            theme={`${type === TYPE_OPTIONS.TOP ? "contained" : "outlined"} rounded`}
            click={() => onSetType(TYPE_OPTIONS.TOP)}
          >
            Top
          </BaseButton>
          <BaseButton
            className="d-none d-md-flex"
            size="small"
            color={type === TYPE_OPTIONS.NEW ? "white" : "gray"}
            theme={`${type === TYPE_OPTIONS.NEW ? "contained" : "outlined"} rounded`}
            click={() => onSetType(TYPE_OPTIONS.NEW)}
          >
            New
          </BaseButton>
          <BaseButton
            className="d-none d-md-flex"
            size="small"
            color={type === TYPE_OPTIONS.ALL ? "white" : "gray"}
            theme={`${type === TYPE_OPTIONS.ALL ? "contained" : "outlined"} rounded`}
            click={() => onSetType(TYPE_OPTIONS.ALL)}
          >
            All
          </BaseButton>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
