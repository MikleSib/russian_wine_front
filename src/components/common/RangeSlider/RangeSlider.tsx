import React, { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import "./RangeSlider.styles.scss";

type RangeSliderProps = {
  defaultValues: [number, number];
  onChange: React.Dispatch<React.SetStateAction<number[]>>;
  onClearCallback?: (prop: () => void) => void;
};

const RangeSlider: FC<RangeSliderProps> = memo(({ defaultValues, onClearCallback, onChange }) => {
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(0);

  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  let prevDefaultValues = [0, 0];

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) =>
      Math.round(((value - defaultValues[0]) / (defaultValues[1] - defaultValues[0])) * 100),
    [minVal, maxVal, defaultValues],
  );

  useEffect(() => {
    if (defaultValues.length === 2 && !minVal && !maxVal) {
      setMinVal(defaultValues[0] || 0);
      setMaxVal(defaultValues[1] || 0);
    }
    // thumbs only inside defaultValues
    if (prevDefaultValues[0] !== defaultValues[0] || prevDefaultValues[1] !== defaultValues[1]) {
      if (defaultValues.length === 2 && defaultValues[0] > minVal) {
        setMinVal(defaultValues[0]);
        // console.log(defaultValues[0]);
      }
      if (defaultValues.length === 2 && defaultValues[1] < maxVal) {
        setMaxVal(defaultValues[1]);
        // console.log(defaultValues[1]);
      }
      prevDefaultValues = defaultValues;
      // if (minValRef.current && maxValRef.current) {
      //   setMaxVal(+maxValRef.current.value);
      //   if (defaultValues[0] !== minVal) {
      //     const qwe = +minValRef.current.value;
      //     setMinVal(qwe);
      //     console.log(9999);
      //     setUpdateTrigger(true);
      //   } else if (defaultValues[1] !== maxVal) {
      //     const qwe = +maxValRef.current.value;
      //     setMaxVal(qwe);
      //     console.log(8888);
      //     setUpdateTrigger(true);
      //   } else {
      //     setUpdateTrigger(false);
      //   }
      //   if (range.current) {
      //     console.log(range.current.style.left);
      //     console.log(range.current.style.width);
      //     console.log(minValRef.current.value, minVal, defaultValues[0]);
      //     console.log(maxValRef.current.value, maxVal, defaultValues[1]);
      //   }
      // }
    }
  }, [defaultValues]);

  // Get min and max values when their state changes
  useEffect(() => {
    onChange([minVal, maxVal]);
    // console.log("onChange([minVal, maxVal])");
  }, [minVal, maxVal, onChange]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
        // console.log(123123);
      }
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
        // console.log(34354345);
      }
    }
  }, [maxVal, getPercent]);

  const handleChangeRange = (type: "min" | "max") => {
    return (event: React.ChangeEvent<HTMLInputElement>): void => {
      let value = Number(event.target.value.replace(",", "."));

      if (type === "min") {
        value = Math.min(value, maxVal);
        setMinVal(value);
      } else {
        value = Math.max(value, minVal);
        setMaxVal(value);
      }
      event.target.value = value.toString();
    };
  };

  // this hack for clear child state from parent
  onClearCallback &&
    onClearCallback(() => {
      setMinVal(defaultValues[0]);
      setMaxVal(defaultValues[1]);
    });

  return (
    <div className="range__container">
      <div className="range__inputs">
        <input
          type="number"
          className="range__value"
          value={minVal}
          onChange={handleChangeRange("min")}
        />
        to
        <input
          type="number"
          className="range__value"
          value={maxVal}
          onChange={handleChangeRange("max")}
        />
      </div>

      <input
        className={clsx("range__thumb range__thumb--zindex-3", {
          "range__thumb--zindex-5": minVal > defaultValues[0],
        })}
        type="range"
        min={defaultValues[0] || 0}
        max={defaultValues[1] || 0}
        value={minVal}
        ref={minValRef}
        step={1}
        onChange={handleChangeRange("min")}
      />
      <input
        className="range__thumb range__thumb--zindex-4"
        type="range"
        min={defaultValues[0] || 0}
        max={defaultValues[1] || 0}
        value={maxVal}
        ref={maxValRef}
        step={1}
        onChange={handleChangeRange("max")}
      />
      <div className="range__slider">
        <div className="range__slider-track" />
        <div ref={range} className="range__slider-fill" />
      </div>
    </div>
  );
});

export default RangeSlider;
