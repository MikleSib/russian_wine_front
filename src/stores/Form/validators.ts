export const required = (text?: string, canBeZero = false): TValidator => {
  return (value) => {
    if (Array.isArray(value) && !value.length) {
      return text || "Field is required";
    }

    if (
      value === "" ||
      // eslint-disable-next-line eqeqeq
      (!canBeZero && value == 0) ||
      value === undefined ||
      value === null ||
      value === false ||
      (Object.entries(value).length === 0 && value.constructor === Object)
    ) {
      return text || "Field is required";
    }
  };
};

export const when = (
  condition: (value: any, fields: TFieldsState<any>) => any,
  func: TValidator,
) => {
  return (value: any, fields: TFieldsState<any>) => {
    if (condition(value, fields)) {
      return func(value, fields);
    }
  };
};

export const custom = (func: TValidator) => (value: any, fields: TFieldsState<any>) => {
  return func(value, fields);
};

export const email = (): TValidator => (value: string) => {
  if (
    // eslint-disable-next-line max-len
    !/^(([^<>()[\]\\~!#$%^&*+={}`.,;:\s@"]+(\.[^<>()[\]\\~!#$%^&*+={}`.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
      value,
    )
  ) {
    return "Invalid email format";
  }
};

export const nickname = (): TValidator => (value: string) => {
  if (!/^[A-Za-z0-9_]{4,20}$/.test(value)) {
    return "Must be at least 4 characters, contain Latin alphabet letters, numbers, underscore";
  }
};

export const password = (): TValidator => (value: string) => {
  if (
    !/^\S*(?=\S{8,})(?=\S*[a-z])(?=\S*[A-Z])(?=\S*[\d])(?=\S*[!@#$%^&*()\-_=+{};:,<.>])\S*$/.test(
      value,
    )
  ) {
    return "Password must be at least 8 characters long, 1 special character contain upper and lower case letters of the Latin alphabet and numbers";
  }
};

export const sameAs = (field: string, text = "This field should match"): TValidator => {
  return (value?: string, fields?) => {
    if (value !== fields[field]) {
      return text ? text : "";
    }
  };
};

export const letters = (): TValidator => (value: string) => {
  if (!/^[A-Za-zА-Яа-яЁё\-\s]*$/.test(value)) {
    return "Only letters are allowed";
  }
};
