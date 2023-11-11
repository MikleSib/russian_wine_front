import React, { useCallback, useState } from "react";
import clsx from "clsx";

import { ReactComponent as ArrowIcon } from "assets/icons/down-arrow.svg";
import { CheckboxGroup } from "components";

interface WineYearFilterProps {
  title?: string;
  options?: FilterSelectValueType[];
  values: string[];
  onChangeValue: (values: string[]) => void;
}

export function WineYearFilter({
  title,
  options = [],
  values,
  onChangeValue,
}: WineYearFilterProps) {
  const [isVisible, toggleVisible] = useState(true);
  const [showMore, toggleShowMore] = useState(false);

  const handleToggleVisible = useCallback(() => {
    toggleVisible(!isVisible);
  }, [toggleVisible, isVisible]);

  const handleToggleShowMore = useCallback(() => {
    toggleShowMore(!showMore);
  }, [toggleShowMore, showMore]);

  if (!options?.length) return null;

  return (
    <div
      className={clsx("filters__block", {
        "filters__block--hide": !isVisible,
        "filters__block--all": showMore,
      })}
    >
      <div className="filters__block-head" onClick={handleToggleVisible}>
        <span>{title}</span>
        <ArrowIcon />
      </div>
      <div className="filters__block-body">
        <CheckboxGroup options={options} values={values} onSelectOptions={onChangeValue} />
      </div>
      {options.filter(({ count }) => +count).length > 3 && (
        <span className="filters__block-bottom" onClick={handleToggleShowMore}>
          {showMore ? "Less" : "More"}
        </span>
      )}
    </div>
  );
}
