import { CancelToken } from "apisauce";

import api from "services/api/api";

const source = CancelToken.source();

export class StripePaymentApi {
  public static async buyToken(
    poolId: string[],
    currency: string,
  ): TGeneralApiResponse<StripeBuyTokenResponse> {
    return api.post(`/stripe/buy`, { poolId, currency }, { cancelToken: source.token });
  }

  public static async payDelivery(
    // price: number,
    poolIds: number[],
    tokenIds: number[],
    currency: string,
  ): TGeneralApiResponse<StripeBuyTokenResponse> {
    return api.post(
      `/stripe/payDelivery`,
      { poolIds, tokenIds, currency },
      { cancelToken: source.token },
    );
  }

  public static async updateStatus(
    externalPaymentId: string,
  ): TGeneralApiResponse<{ status: string }> {
    return api.post(
      `/stripe/update_status/${externalPaymentId}`,
      {},
      { cancelToken: source.token },
    );
  }
}
