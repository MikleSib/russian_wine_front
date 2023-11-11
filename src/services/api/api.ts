import { AxiosRequestConfig } from "axios";
import { ApiResponse, ApisauceInstance, create, DEFAULT_HEADERS } from "apisauce";

import { routes } from "utils/router";
import { DEFAULT_API_CONFIG } from "./api.config";

class ApiService {
  private _apisauce: ApisauceInstance;
  private _config: IApiConfig;

  constructor(config: IApiConfig = DEFAULT_API_CONFIG) {
    this._config = config;

    this._apisauce = create({
      baseURL: `${this._config.apiHost}/${this._config.baseUrl}/v${this._config.version}/`,
      timeout: this._config.timeout,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        ...DEFAULT_HEADERS,
      },
      withCredentials: true,
    });

    this._setup();
  }

  private _setup(): void {
    this._apisauce.addRequestTransform((request) => {
      if (window.CSRF_TOKEN) {
        request.headers["X-CSRF-TOKEN"] = window.CSRF_TOKEN;
      }
    });

    this._apisauce.addResponseTransform((response) => {
      if (response.data) {
        if (
          (response.status === 401 || response.status === 401) &&
          response.config?.url !== "/personal_area/self_information"
        ) {
          window.location.href = routes.login.path;
        }

        if (response.data.notification) {
          // Notify.success(response.data.notification);
        }

        if (response.data.warning) {
          // Notify.warning(response.data.warning);
        }

        if (response.data.errors && /^4\d{2}$/.test(response.data.status)) {
          const { errors, _token, status } = response.data;
          Object.keys(errors).forEach((key) => {
            if (_token && status === 419) {
              return;
            } else {
              // errors[key]?.[0] && Notify.error(errors[key]?.[0]);
            }
          });
        }
      }
    });

    this._apisauce.addMonitor((response) => {
      if (
        response.data &&
        response.data._token &&
        response.data &&
        response.config?.method === "post"
      ) {
        window.CSRF_TOKEN = response.data._token;
      }
    });
  }

  static async _apiRequest<TData>(
    apiRequest: Promise<ApiResponse<TGeneralApiSuccess<TData>, TGeneralApiProblem>>,
  ): TGeneralApiResponse<TData> {
    return apiRequest.then((response: ApiResponse<any>) => {
      const { data } = response;

      if (data?.errors) {
        // eslint-disable-next-line no-throw-literal
        throw {
          response: null,
          errors: data.errors,
          status: data.status,
        };
      }

      return data;
    });
    // .catch((error: ApiResponse<any>) => Promise.resolve({ response: null, errors: error, status: 422 }));
  }

  public get<TData>(
    url: string,
    params?: Record<string, any>,
    axiosConfig?: AxiosRequestConfig,
  ): TGeneralApiResponse<TData> {
    return ApiService._apiRequest<TData>(this._apisauce.get(url, params, axiosConfig));
  }

  public post<TData>(
    url: string,
    data: any = {},
    axiosConfig?: AxiosRequestConfig,
  ): TGeneralApiResponse<TData> {
    return ApiService._apiRequest<TData>(this._apisauce.post(url, data, axiosConfig));
  }

  public delete<TData>(
    url: string,
    params?: Record<string, any>,
    axiosConfig?: AxiosRequestConfig,
  ): TGeneralApiResponse<TData> {
    return ApiService._apiRequest<TData>(this._apisauce.delete(url, params, axiosConfig));
  }
}

export default new ApiService();
