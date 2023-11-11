import { useQuery } from "react-query";

import { TOP_SALES_PERIOD } from "constants/index";
import { SimpleListApi } from "services/simpleList/simpleListApi";

interface UseTopSalesResult {
  isLoading: boolean;
  sales: TopSale[];
}

export function useTopSales(period: TOP_SALES_PERIOD): UseTopSalesResult {
  const { data, isLoading, isIdle } = useQuery(["top-sales", { period }], () =>
    SimpleListApi.getTopSales(period),
  );

  return {
    isLoading: isIdle || isLoading,
    sales: data?.response || [],
  };
}
