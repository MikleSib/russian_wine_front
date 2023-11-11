import { useQuery } from "react-query";

import { SimpleListApi } from "services/simpleList/simpleListApi";

interface UseCountriesForDeliveryResult {
  countriesLoading: boolean;
  countries: Country[];
}

export function useCountriesForDelivery(): UseCountriesForDeliveryResult {
  const { data, isLoading, isIdle } = useQuery("country-for-delivery", () =>
    SimpleListApi.getCountriesForDelivery(),
  );

  return {
    countriesLoading: isIdle || isLoading,
    countries: data?.response || [],
  };
}
