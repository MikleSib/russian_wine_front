import { useQuery } from "react-query";

import { SimpleListApi } from "services/simpleList/simpleListApi";

interface UseDashboardBannersResult {
  bannersLoading: boolean;
  banners: BannerResponse[];
}

export function useDashboardBanners(): UseDashboardBannersResult {
  const { data, isLoading, isIdle } = useQuery("banners", () =>
    SimpleListApi.getDashboardBanners(),
  );

  return {
    bannersLoading: isIdle || isLoading,
    banners: data?.response || [],
  };
}
