import { escapeBasePathFromRoute, routes } from "utils/router";
import { capitalize, pascalCaseToCamel } from "utils";
import { email, Form, letters, nickname, password, required, sameAs, when } from "../Form";
import AuthStore from "./auth.store";
import { AuthService } from "./auth.service";

export function initAuthForm(storeCtx: AuthStore): Form {
  return new Form({
    fields: {
      email: {
        type: String,
        validators: [
          required("Your e-mail field can not be empty"),
          email(),
          when(
            () => window.location.pathname.includes(routes.register.path),
            (value) => {
              if (value.length < 6 || value.length > 150) {
                return "Invalid email format";
              }
            },
          ),
        ],
      },
      nickname: {
        type: String,
        validators: [
          required("Your nickname field can not be empty"),
          when(() => window.location.pathname.includes(routes.register.path), nickname()),
        ],
      },
      password: {
        type: String,
        validators: [
          required("Your password field can not be empty"),
          when(
            () =>
              [routes.register.path, routes.resetPassword.path].includes(
                escapeBasePathFromRoute(window.location.pathname),
              ),
            password(),
          ),
        ],
      },
      repeatPassword: {
        type: String,
        validators: [
          required("Your password field can not be empty"),
          when(
            () =>
              [routes.register.path, routes.resetPassword.path].includes(
                escapeBasePathFromRoute(window.location.pathname),
              ),
            sameAs("password", "Passwords do not match, try again"),
          ),
        ],
      },
    },
    async onSubmit({ pathname, token }) {
      // @ts-ignore
      await storeCtx[`submit${capitalize(pascalCaseToCamel(pathname.slice(1)))}`](token);
    },
  });
}

export function initPersonalForm(storeCtx: AuthStore): Form {
  return new Form({
    fields: {
      firstName: {
        type: String,
        validators: [when((value) => Boolean(value), letters())],
      },
      lastName: {
        type: String,
        validators: [when((value) => Boolean(value), letters())],
      },
      email: {
        type: String,
      },
      nickname: {
        type: String,
        validators: [required(), nickname()],
      },
      description: {
        type: String,
      },
      keep_private: {
        type: Boolean,
      },
    },
    async onSubmit(payload: any) {
      storeCtx.personalInfoForm.setFetchStatus("loading");

      const { firstName, lastName, nickname, description, keep_private } =
        storeCtx.personalInfoForm.getAllFields();

      const body = {
        nickname: nickname,
        first_name: firstName,
        last_name: lastName,
        description: description,
        keep_private: keep_private,
      };

      try {
        await AuthService.postUserInfo({ body });
        await storeCtx.fetchSelfInformation(false);

        storeCtx.personalInfoForm.setFetchStatus("success");
      } catch (errors: any) {
        storeCtx.personalInfoForm.setFetchStatus("error");
        console.error(errors);
      }
    },
  });
}

export function initDeliveryForm(storeCtx: AuthStore): Form {
  return new Form({
    fields: {
      country_code: {
        type: String,
        validators: [required()],
      },
      phone_code: {
        type: String,
        // validators: [required()],
      },
      phone_number: {
        type: String,
        validators: [required()],
      },
      first_name: {
        type: String,
        validators: [required(), letters()],
      },
      last_name: {
        type: String,
        validators: [required(), letters()],
      },
      street_address: {
        type: String,
        validators: [required()],
      },
      street_address2: {
        type: String,
      },
      city: {
        type: String,
        validators: [required()],
      },
      region: {
        type: String,
      },
      zip_code: {
        type: String,
        validators: [required()],
      },
      email: {
        type: String,
      },
      nickname: {
        type: String,
      },
    },
    async onSubmit({
      createNewDelivery,
    }: {
      createNewDelivery: (deliveryData: DeliveryFormCreate) => Promise<void>;
    }) {
      storeCtx.deliveryForm.setFetchStatus("loading");

      const {
        country_code,
        phone_code,
        phone_number,
        first_name,
        last_name,
        zip_code,
        city,
        region,
        street_address,
        street_address2,
      } = storeCtx.deliveryForm.getAllFields();

      const { email } = storeCtx.personalInfoForm.getAllFields();

      const body: DeliveryFormCreate = {
        country_code,
        phone_code,
        phone_number,
        first_name,
        last_name,
        zip_code,
        city,
        region,
        street_address,
        street_address2,
        email,
      };

      try {
        await createNewDelivery(body);
        storeCtx.deliveryForm.setFetchStatus("success");
      } catch (errors: any) {
        storeCtx.deliveryForm.setFetchStatus("error");
        console.error(errors);
      }
    },
  });
}
