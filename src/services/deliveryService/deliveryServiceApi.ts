import { CancelToken } from "apisauce";

import api from "services/api/api";

const source = CancelToken.source();

export class DeliveryServiceApi {
  static async getDeliveryInformation({
    body,
  }: GeneralRequest<{
    poolIds: number[];
    tokenIds: number[];
  }>): TGeneralApiResponse<[] | DeliveryResponse[]> {
    return api.post("/personal_area/concrete_bottle/delivery_service/show", body, {
      cancelToken: source.token,
    });
  }

  static async getDeliveriesInformation({
    body,
  }: GeneralRequest<{
    poolIds: number[];
    tokenIds: number[];
  }>): TGeneralApiResponse<[] | DeliveryResponse> {
    return api.post("/personal_area/concrete_bottle/delivery_service/show", body, {
      cancelToken: source.token,
    });
  }

  static async createDelivery({
    body,
  }: GeneralRequest<
    DeliveryFormCreate & {
      poolIds: number[];
      tokenIds: number[];
    }
  >): TGeneralApiResponse<DeliveryResponse> {
    return api.post("/personal_area/concrete_bottle/delivery_service/create", body, {
      cancelToken: source.token,
    });
  }
}
