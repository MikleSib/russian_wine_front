import React, { FC, memo, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import clsx from "clsx";

import { ReactComponent as SearchIcon } from "assets/icons/loupe.svg";

import "./BaseSearch.styles.scss";

type BaseSearchProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  isRounded?: boolean;
};
const BaseSearch: FC<BaseSearchProps> = memo(
  ({ onChange: onChangeCallback, placeholder = "Search", className, isRounded = false }) => {
    const [searchText, setSearchText] = useState("");

    const debouncedOnChange = useMemo(
      () => debounce((e: React.ChangeEvent<HTMLInputElement>) => onChangeCallback(e), 500),
      [onChangeCallback],
    );

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
      debouncedOnChange(e);
    };

    return (
      <div className={clsx("baseSearch", className, { "baseSearch--rounded": isRounded })}>
        <SearchIcon />
        <input
          type="text"
          className="baseSearch__input"
          placeholder={placeholder}
          onChange={onChange}
          value={searchText}
        />
      </div>
    );
  },
);

export default BaseSearch;
