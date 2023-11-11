import { CancelToken } from "apisauce";

import api from "services/api/api";

const source = CancelToken.source();

export class MarketSaleApi {
  public static async getMarketSale({
    body,
  }: GeneralRequest<FilterParamsRequest>): TGeneralApiResponse<MarketSaleResponse> {
    return api.post("/public/market_sale", body, { cancelToken: source.token });
  }

  public static async getMarketSaleByOrderId({
    orderId,
  }: {
    orderId: string;
  }): TGeneralApiResponse<MarketWineRaw> {
    return api.get(`/public/market_sale/${orderId}`, undefined, { cancelToken: source.token });
  }
}
