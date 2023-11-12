import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import debounce from "lodash.debounce";

import { RangeSlider } from "components/common";
import { ReactComponent as ArrowIcon } from "assets/icons/down-arrow.svg";

interface PriceFilterProps {
  onChangeValue: React.Dispatch<React.SetStateAction<number[]>>;
  values: [number, number];
  onClearCallback?: (prop: () => void) => void;
}

export function PriceFilter({ onChangeValue, values, onClearCallback }: PriceFilterProps) {
  const [isVisible, toggleVisible] = useState(true);

  const handleToggleVisible = useCallback(() => {
    toggleVisible(!isVisible);
  }, [toggleVisible, isVisible]);

  const debouncedChangeHandler = useMemo(() => debounce(onChangeValue, 500), []);

  return (
    <div
      className={clsx("filters__block", {
        "filters__block--hide": !isVisible,
      })}
    >
      <div className="filters__block-head" onClick={handleToggleVisible}>
        <span>Цена</span>
        <ArrowIcon />
      </div>
      <div className="filters__block-body px-0">
        <RangeSlider
          defaultValues={values}
          onChange={debouncedChangeHandler}
          onClearCallback={onClearCallback}
        />
      </div>
    </div>
  );
}
