import * as React from 'react';
import {IField, IFieldType} from "./field";
import {getDisplayName} from "./util";
import {Validator} from "../validation/validator";

export class Form implements IForm {
    fields: Map<string, IField[]> = new Map();
    component: React.Component<any, any>;
    validators: Validator[];

    constructor(component: React.Component<any, any>) {
        this.component = component;
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

    forEach = (fn: (field?: IField) => boolean | void): void => {
        main:
        for (let [name, fields] of this.fields) {
            for (let [k, field] of fields.entries()) {
                if (fn(field) === false) {
                    break main;
                }
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

    getFormValue = (): any => {
        let fv: any = {};
        for (let [name, fields] of this.fields) {
            fv[name] = this.getValue(name);
        }
        return fv;
    };

    hasError = (): boolean => {
        for (let [name, fields] of this.fields) {
            for (let [k, field] of fields.entries()) {
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

    registerField = (field: IField) => {
        const name = this.getNameFromField(field);
        const index = this.getIndexFromField(field);

        if (!this.fields.has(name)) {
            this.fields.set(name, []);
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

    addValidator = (validator: Validator, update: boolean = true): Form => {
        this.validators.push(validator);
        if (update) this.component.forceUpdate();
        return this;
    };

    removeValidator = (validator: Validator, update: boolean = true): Form => {
        const index = this.validators.indexOf(validator);
        if (index === -1) return;
        this.validators.splice(index, 1);
        if (update) this.component.forceUpdate();
        return this;
    };

    onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO Implement
        console.log(e);
    }
}

// TODO Move onSubmit out of IForm
// TODO Add setValue
export interface IForm {
    deregisterField(field: IField): void
    forEach(fn: (field?: IField) => void): void
    getField(k: string, i: number): IField | void
    getFields(k: string): IField[] | void
    getValue(k?: string): any
    getFormValue(): any
    hasError(): boolean
    hasField(k: string, i: number): boolean
    onSubmit(e: React.FormEvent<HTMLFormElement>): void
    registerField(field: IField): void;
    getNameFromField(field: IField): string
    getIndexFromField(field: IField): number
    setValue(k: string, i: number, v:any): void
    getValidators(): Validator[];
    addValidator(validator: Validator, update?: boolean): IForm;
    removeValidator(validator: Validator, update?: boolean): IForm;
    validate(): boolean;
    validateField(k: string, i: number): boolean
}

export type FormProps = {}

export const FormContext = React.createContext({});

export const asForm = <T extends FormProps>() => {
    return function (WrappedComponent: React.ComponentClass<T>): React.ComponentClass<T> {
        return class WithForm extends React.Component<T> {
            static displayName: string = `AsForm(${getDisplayName(WrappedComponent)})`;
            form: IForm;

            constructor(props: T) {
                super(props);
                this.form = new Form(this);
            }

            render() {
                return (
                    <FormContext.Provider value={this.form}>
                        <WrappedComponent {...this.props}/>
                    </FormContext.Provider>
                );
            }

            componentWillReceiveProps() {
                // TODO Make sure entity is up to date with props
            }
        }
    }
};