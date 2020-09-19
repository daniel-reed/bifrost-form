import * as React from 'react';
import {IField, IFieldType} from "./field";
import {getDisplayName} from "./util";
import {Validator} from "..";

export class FormController implements IForm {
    component: React.Component<any, any>;
    fields: Map<string, IField[]> = new Map();
    name: string;
    validators: Validator[];

    constructor() {}

    setComponent(component: React.Component<any, any>): FormController {
        this.component = component;
        return this;
    }

    deregisterField = (field: IField) => {
        const name = this.getNameFromField(field);
        const index = this.getIndexFromField(field);
        if (!this.hasField(name, index)) return;

        this.fields.get(name).slice(index, 1);
        if (this.fields.get(name).length == 0) {
            this.fields.delete(name);
        }
        this.component.forceUpdate();
    };

    forEach = (fn: (field?: IField) => any): void => {
        for (let [, fields] of this.fields) {
            for (let [, field] of fields.entries()) {
                fn(field);
            }
        }
    };

    getField = (k: string, i: number): IField | void => {
        if (!this.hasField(k, i)) return;
        return this.fields.get(k)[i];
    };

    getFields = (k:string): IField[] | void => {
        if (!this.fields.has(k)) return;
        return this.fields.get(k);
    };

    getValue = (k?: string): any => {
        if (!this.fields.has(k)) {
            return undefined;
        }
        if (this.fields.get(k).length > 1) {
            let col: Array<any> = [];
            this.fields.get(k).forEach((sv, sk) => {
                col[sk] = sv.getValue();
            });
            return col;
        }
        if (this.fields.get(k).length == 1) {
            let col: any = undefined;
            this.fields.get(k).forEach((sv) => {
                if (sv.getType() === IFieldType.Array) {
                    col = [sv.getValue()];
                } else {
                    col = sv.getValue();
                }
            });
            return col;
        }

        return undefined;
    };

    getFormName = (): string => {
        return this.name;
    };

    setFormName = (name: string, update: boolean = true): FormController => {
        this.name = name;
        if (update) this.component.forceUpdate();
        return this;
    };

    getFormValue = (): any => {
        let fv: any = {};
        for (let [name] of this.fields) {
            fv[name] = this.getValue(name);
        }
        return fv;
    };

    setFormValueFromJson = (json: any): FormController => {
        if (typeof json !== 'object') return this;
        for (const name in json) {
            if (!json.hasOwnProperty(name)) continue;
            if (!this.fields.has(name)) continue;
            const asArray = Array.isArray(json[name]) ? json[name] : [json[name]];
            for (let i = 0; i < asArray.length; i++) {
                const field = this.getField(name, i);
                if (!field) continue;
                if (field.getType() === IFieldType.Collection) {
                    field.setValueFromJson(asArray);
                    break;
                }
                field.setValueFromJson(asArray[i]);
            }
        }
        this.component.forceUpdate();
        return this;
    };

    hasError = (): boolean => {
        for (let [, fields] of this.fields) {
            for (let [, field] of fields.entries()) {
                if (field.hasError()) return true;
            }
        }
        return false;
    };

    hasField(k: string, i: number) {
        if (!this.fields.has(k)) {
            return false;
        }
        return !!this.fields.get(k)[i];
    }

    getNameFromField = (field: IField): string => {
        return field.getFieldName();
    };

    getIndexFromField = (field: IField): number => {
        return field.getFieldIndex();
    };

    registerField = (field: IField, inheritValue: boolean = true) => {
        const name = this.getNameFromField(field);
        const index = this.getIndexFromField(field);
        if (!this.fields.has(name)) {
            this.fields.set(name, []);
        }
        const existingField = this.getField(name, index);
        if (inheritValue && existingField) {
            field.setValue(existingField.getValue(), false) ;
        }
        this.fields.get(name)[index] = field;
        this.component.forceUpdate();
    };

    setValue = (k: string, i: number, v: any) => {
        if (!this.hasField(k, i)) return;
        this.fields.get(k)[i].setValue(v);
    };

    validate = (): boolean => {
        this.forEach((field: IField) => {
            field.validate();
        });
        return !this.hasError();
    };

    validateField = (k: string, i: number) => {
        if (!this.hasField(k, i)) return false;
        return this.fields.get(k)[i].validate();
    };

    getValidators = (): Validator[] => {
        return this.validators;
    };

    addValidator = (validator: Validator, update: boolean = true): FormController => {
        this.validators.push(validator);
        if (update) this.component.forceUpdate();
        return this;
    };

    removeValidator = (validator: Validator, update: boolean = true): FormController => {
        const index = this.validators.indexOf(validator);
        if (index === -1) return;
        this.validators.splice(index, 1);
        if (update) this.component.forceUpdate();
        return this;
    };
}

export interface IForm {
    setComponent(component: React.Component<any, any>): IForm;
    deregisterField(field: IField): void
    forEach(fn: (field?: IField) => void): void
    getField(k: string, i: number): IField | void
    getFields(k: string): IField[] | void
    getValue(k?: string): any
    getFormName(): string;
    setFormName(name: string, update?: boolean): IForm;
    getFormValue(): any;
    setFormValueFromJson(json: any): IForm;
    hasError(): boolean
    hasField(k: string, i: number): boolean
    registerField(field: IField, inheritValue?: boolean): void;
    getNameFromField(field: IField): string
    getIndexFromField(field: IField): number
    setValue(k: string, i: number, v:any): void
    getValidators(): Validator[];
    addValidator(validator: Validator, update?: boolean): IForm;
    removeValidator(validator: Validator, update?: boolean): IForm;
    validate(): boolean;
    validateField(k: string, i: number): boolean
}

export type SubmitHandler = (e?: React.FormEvent<HTMLFormElement>, form?: IForm) => void;

export type FormProps = {
    name: string,
    onSubmit?: SubmitHandler
}

export const FormContext = React.createContext({});

export const asForm = <T extends FormProps>(form?: IForm) => {
    return function (WrappedComponent: React.ComponentClass<T>): React.ComponentClass<T> {
        return class AsForm extends React.Component<T> {
            static displayName: string = `AsForm(${getDisplayName(WrappedComponent)})`;
            form: IForm;
            orideProps: Partial<FormProps>;

            constructor(props: T) {
                super(props);
                this.form = form || new FormController();
                this.form.setComponent(this);
                this.form.setFormName(props.name, false);
                this.orideProps = {
                    onSubmit: this.handleSubmit,
                }
            }

            render() {
                return (
                    <FormContext.Provider value={this.form}>
                        <WrappedComponent {...this.cleanProps()}/>
                    </FormContext.Provider>
                );
            }

            cleanProps = (): any => {
                const ptProps = Object.assign({}, this.props as any, this.orideProps);
                ptProps.name = this.form.getFormName();
                return ptProps;
            };

            componentWillReceiveProps() {
                // TODO Make sure entity is up to date with props
            }

            handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                // TODO Provide Default Submission behavior for post/get
                if (typeof this.props.onSubmit === 'function') {
                    this.props.onSubmit(e, this.form);
                }
            }
        }
    }
};