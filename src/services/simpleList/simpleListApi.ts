import { CancelToken } from "apisauce";

import { TOP_SALES_PERIOD } from "constants/index";
import api from "services/api/api";

const source = CancelToken.source();

export class SimpleListApi {
  public static async getDashboardBanners(): TGeneralApiResponse<BannerResponse[]> {
    return api.get("/public/simple_list/dashboard_banner", undefined, {
      cancelToken: source.token,
    });
  }

  public static async getTopRegions(): TGeneralApiResponse<TopRegion[]> {
    return api.get("/public/simple_list/first_page_filter", undefined, {
      cancelToken: source.token,
    });
  }

  public static async getTopSales(period: TOP_SALES_PERIOD): TGeneralApiResponse<TopSale[]> {
    return api.get(`/public/top_sales_block/${period}`, undefined, {
      cancelToken: source.token,
    });
  }

  static getCountriesForDelivery(): TGeneralApiResponse<Country[]> {
    return api.get("/public/simple_list/country_for_delivery", undefined, {
      cancelToken: source.token,
    });
  }
}
