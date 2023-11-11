import { CancelToken } from "apisauce";

import api from "services/api/api";

const source = CancelToken.source();

export class FirstSaleApi {
  public static async getFirstSale({
    body,
  }: GeneralRequest<FilterParamsRequest>): TGeneralApiResponse<FirstSaleResponse> {
    return api.post("/public/first_sale", body, { cancelToken: source.token });
  }

  public static async getFirstSaleById({
    poolId,
  }: {
    poolId: string;
  }): TGeneralApiResponse<WineRaw> {
    return api.get(`/public/first_sale_by_name_and_year/${poolId}`, undefined, {
      cancelToken: source.token,
    });
  }
}
