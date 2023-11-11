import { CancelToken } from "apisauce";

import api from "services/api/api";
import { SUMSUB_STATUS } from "constants/index";

const source = CancelToken.source();

export class AuthService {
  public static getGeetest(): TGeneralApiResponse<GeetestResponse> {
    return api.get("/geetest", undefined, { cancelToken: source.token });
  }

  public static login({ body }: GeneralRequest<LoginBody>): TGeneralApiResponse {
    return api.post("/auth/login", body, { cancelToken: source.token });
  }

  public static register({ body }: GeneralRequest<RegisterBody>): TGeneralApiResponse {
    return api.post("/auth/register", body, { cancelToken: source.token });
  }

  public static getSelfInformation(): TGeneralApiResponse<SelfInformationResponse> {
    return api.post("/personal_area/self_information", {}, { cancelToken: source.token });
  }

  public static getUserInformation({
    body,
  }: GeneralRequest<{ nickname: string }>): TGeneralApiResponse<SelfInformationResponse> {
    return api.post("/public/show_user/info", body, { cancelToken: source.token });
  }

  public static confirmAccount({ body }: GeneralRequest<{ token: string }>): TGeneralApiResponse {
    return api.post("/auth/register/confirmation", body, { cancelToken: source.token });
  }

  public static forgotPassword({ body }: GeneralRequest<ForgotPasswordBody>): TGeneralApiResponse {
    return api.post("/auth/reset_password/email", body, { cancelToken: source.token });
  }

  public static resetPassword({ body }: GeneralRequest<ResetPasswordBody>): TGeneralApiResponse {
    return api.post("/auth/reset_password/reset", body, { cancelToken: source.token });
  }

  public static logout(): TGeneralApiResponse {
    return api.get("/auth/logout", undefined, { cancelToken: source.token });
  }

  public static postUserInfo({ body }: GeneralRequest<UpdateUserBody>): TGeneralApiResponse {
    return api.post("/personal_area/self_information/update_info", body, {
      cancelToken: source.token,
    });
  }

  public static postUserImage({ body }: GeneralRequest<FormData>): TGeneralApiResponse {
    return api.post("/personal_area/self_information/update/image", body, {
      cancelToken: source.token,
    });
  }

  public static postDetachWalletAddress({
    body,
  }: GeneralRequest<{ blockchain_address: string }>): TGeneralApiResponse {
    return api.post("/personal_area/self_information/detach_blockchain_address", body, {
      cancelToken: source.token,
    });
  }

  public static postSubscribing({
    body,
    params,
  }: GeneralRequest<{ nickname: string }, { type: "add" | "remove" }>): TGeneralApiResponse {
    return api.post(`/personal_area/subscribing/${params?.type}`, body, {
      cancelToken: source.token,
    });
  }

  static getSumSubToken(): TGeneralApiResponse<Array<string>> {
    return api.get("/personal_area/kyc/get_token");
  }

  static getKycStatus(): TGeneralApiResponse<Array<null | SUMSUB_STATUS>> {
    return api.get("/personal_area/kyc/get_status");
  }
}
