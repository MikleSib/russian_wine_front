import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { BaseButton } from "components/common";
import { COLOR_OPTIONS } from "constants/index";

interface DashboardColorFilterProps {
  pathname: string;
}

export function DashboardColorFilter({ pathname }: DashboardColorFilterProps) {
  const navigate = useNavigate();

  const handleClickGoTo = useCallback(
    (color?: string) => {
      navigate(pathname, { state: color !== undefined ? { color } : null });
    },
    [navigate, pathname],
  );

  return (
    <div className="dashboard__top-filters">
      <BaseButton
        className="d-none d-md-flex"
        size="small"
        color="gray"
        theme="outlined rounded"
        click={() => handleClickGoTo(COLOR_OPTIONS.RED)}
      >
        Красное
      </BaseButton>
      <BaseButton
        className="d-none d-md-flex"
        size="small"
        color="gray"
        theme="outlined rounded"
        click={() => handleClickGoTo(COLOR_OPTIONS.WHITE)}
      >
        Белое
      </BaseButton>
      <BaseButton size="small" theme="contained rounded" click={() => handleClickGoTo()}>
        Все
      </BaseButton>
    </div>
  );
}
