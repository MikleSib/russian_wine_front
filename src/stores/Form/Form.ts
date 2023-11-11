import { action, computed, makeObservable, observable } from "mobx";
import debounce from "lodash.debounce";

export class Form<TFields = any> {
  private readonly fields: TFieldsHash<TFields>;
  private readonly defaultValues: TDefaultValues | undefined;
  private readonly debouncedFieldValidators: Hash<() => any>;
  public onSubmit: (payload: any) => void;

  @observable
  public state: IFormState<TFields>;

  constructor(private options: IFormOptions<TFields>) {
    makeObservable(this);

    this.fields = this.options.fields;
    this.defaultValues = this.options.defaultValues;
    this.state = this.getDefaultState();
    this.onSubmit = this.options.onSubmit;
    this.options.debounce = this.options.debounce || 300;

    Object.keys(this.fields).forEach((field) => {
      if (!this.fields[field as keyof TFields].hooks) {
        this.fields[field as keyof TFields].hooks = {};
      }
    });

    this.debouncedFieldValidators = Object.keys(this.fields).reduce((acc, key) => {
      acc[key] = debounce(() => {
        this.validate(key);
      }, this.options.debounce);

      return acc;
    }, {} as Hash<() => any>);
  }

  @action
  public setErrors(errors: TErrorsState): void {
    const err = Object.assign({}, errors);
    const keys = Object.keys(err);

    for (let i = 0, { length } = keys; i < length; i++) {
      const key = keys[i];

      if (!Object.prototype.hasOwnProperty.call(this.state.fields, key) && key !== "form") {
        delete err[key];
      }
    }

    this.state.errors = Object.assign({}, this.state.errors, err);
  }

  @action
  public setFieldValue({ field, value, trusted = true }: TSetFieldParams): void {
    this.state.fields = Object.assign({}, this.state.fields, {
      [field]: value,
    });

    if (!this.state.touched.has(field as keyof TFields) && trusted) {
      this.state.touched = this.state.touched.add(field as keyof TFields);
    }
  }

  @action
  public setData(fields: TFieldsState<TFields>): void {
    this.state.fields = Object.assign({}, this.state.fields, fields);
  }

  @action
  private setSubmitted(submitted: boolean): void {
    this.state.submitted = submitted;
  }

  @action
  public setFetchStatus(status: TFetchStatus): void {
    this.state.fetchStatus = status;
  }

  @action
  public resetForm(params?: { clearFields: boolean }): void {
    this.state.submitted = false;

    this.state.errors = {};
    this.state.fetchStatus = "init";
    this.state.touched = new Set();

    if (params && params.clearFields) {
      this.state.fields = this.generateFields();
    }
  }

  @action
  public resetFields(fields: string[]): void {
    this.state.fields = Object.assign({}, this.state.fields, this.generateFields(fields));
    fields.forEach((field) => this.clearErrors(field));
  }

  @computed
  get loading(): boolean {
    return this.state.fetchStatus === "loading";
  }

  @computed
  get hasError(): boolean {
    return this.state.fetchStatus === "error";
  }

  public getField(field: string): TFields[keyof TFields] {
    return this.state.fields[field];
  }

  public getAllFields(): TFieldsState<TFields> {
    return this.state.fields;
  }

  public getError(field: string): string {
    const errors = this.state.errors[field] || [];
    return errors.length ? errors[0] : "";
  }

  public isValid(validateOnly: string[] = []): boolean {
    const errorKeys = Object.keys(this.state.errors);

    return !errorKeys.some((field) =>
      validateOnly.length !== 0
        ? validateOnly.includes(field) && this.state.errors[field].length !== 0
        : this.state.errors[field].length !== 0,
    );
  }

  public clearErrors(field: string): void {
    this.setErrors({
      [field]: [],
      form: [],
    });
  }

  public async validate(field: string): Promise<void> {
    const value = this.getField(field);
    const errors = this.validateField(field, value, this.state.fields);

    if (typeof this.getError(field) === "undefined" && errors.length === 0) {
      return;
    }

    this.setErrors({ [field]: errors, form: [] });
  }

  public onBlur({ field, noValidate = false }: { field: string; noValidate: boolean }): void {
    if (noValidate) return;

    this.debouncedFieldValidators[field]();
  }

  public changeField({
    field,
    value,
    trusted = true,
    noInterceptors = false,
    validate = false,
  }: TSetFieldParams & { noInterceptors?: boolean; validate?: boolean }): void {
    if (this.fields[field as keyof TFields].interceptor && !noInterceptors) {
      // eslint-disable-next-line no-param-reassign
      value = this.fields[field as keyof TFields].interceptor?.({
        ctx: this,
        value,
        fields: this.state.fields,
        state: this.state,
      });
    }

    this.setFieldValue({ field, value, trusted });

    if (this.fields[field as keyof TFields]?.hooks?.updated) {
      this.fields[field as keyof TFields]?.hooks?.updated?.({
        ctx: this,
        value,
        fields: this.state.fields,
        state: this.state,
      });
    }

    if (validate) {
      this.debouncedFieldValidators[field]();
    }
  }

  public async submit(params: { payload?: any; meta?: ISubmitMeta }): Promise<void> {
    const { meta, payload } = params || ({} as any);

    if (!this.state.submitted) {
      this.setSubmitted(true);
    }

    const validate = meta && "validate" in meta ? meta.validate : true;

    if (validate) {
      await this.validateAll({
        validateOnly: meta && meta.validateOnly,
      });
    }

    const isValid = this.isValid(meta && meta.validateOnly);

    if (validate && !isValid) return;

    const resp: any = await this.onSubmit(payload);
    console.log(resp);
  }

  public async validateAll(params: { validateOnly?: string[] }): Promise<void> {
    const { validateOnly = [] } = params || {};
    const { fields } = this.state;

    await Promise.all(
      Object.keys(fields)
        .filter((field) => (validateOnly.length !== 0 ? validateOnly.includes(field) : true))
        .map((field) => this.validate(field)),
    );
  }

  @action
  private getDefaultState(): IFormState<TFields> {
    return {
      submitted: false,
      fetchStatus: "init",
      touched: new Set(),
      errors: {},
      fields: this.generateFields(),
    };
  }

  private generateFields(fields?: string[]): TFieldsState<TFields> {
    const fieldsToGenerate = fields || Object.keys(this.fields);
    const hash: TFieldsState<TFields> = {};
    const { length } = fieldsToGenerate;

    for (let i = 0; i < length; i++) {
      const fieldName = fieldsToGenerate[i];
      const field = this.fields[fieldName as keyof TFields];

      hash[fieldName] = this.defaultValues?.[fieldName] || Form.getFieldDefaultValue(field.type);
    }

    return hash;
  }

  private validateField(field: string, value: any, fields: TFieldsState<TFields>): string[] {
    const fieldConfig = this.fields[field as keyof TFields];
    const { validators } = fieldConfig || {};

    if (!validators) {
      return [];
    }

    for (const validator of validators || []) {
      if (typeof validator !== "function") {
        throw new Error("Validator should be function.");
      }

      let result;

      try {
        result = validator(value, fields);
      } catch (e) {
        console.error(e);
      }

      if (result) {
        if (typeof result !== "string") {
          throw new Error("Validator should return string if invalid.");
        }
        return [result];
      }
    }

    return [];
  }

  static getFieldDefaultValue(type: TFieldTypes): TFieldTypes {
    if (!type) {
      throw new Error("Type is required");
    }

    return (type as any)();
  }
}
