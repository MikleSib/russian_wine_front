import { CancelToken } from "apisauce";

import api from "services/api/api";

const source = CancelToken.source();

export class PurchaseApi {
  public static async getPurchased({
    body,
  }: GeneralRequest<FilterParamsRequest>): TGeneralApiResponse<PurchaseResponse> {
    return api.post("/personal_area/self_information/purchased", body, {
      cancelToken: source.token,
    });
  }
}
