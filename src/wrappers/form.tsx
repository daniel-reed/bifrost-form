import * as React from 'react'
import {field} from "./field";

export interface form {
    deregisterField(field: field): void
    forEach(fn: (field?: field) => void): void
    getField(k: string, i: number): field | void
    getValue(k: string): any
    hasError(): boolean
    hasField(k: string, i: number): boolean
    onSubmit(e: React.FormEvent<HTMLFormElement>): void
    registerField(field: field): void;
    setValue(k: string, i: number, v:any): void
    validate(): boolean;
    validateField(k: string, i: number): boolean
}

export type FormProps = {}

export const FormContext = React.createContext({});

export const withForm = <T extends FormProps>() => {
    return function (WrappedComponent: React.ComponentClass<T>): React.ComponentClass<T> {
        return class WithForm extends React.Component<T> implements form {


            static displayName: string = `WithForm(${getDisplayName(WrappedComponent)})`;
            fields: Map<string, Map<number, field>> = new Map();
            form: form;

            constructor(props: T) {
                super(props);

                this.form = {
                    deregisterField: this.deregisterField,
                    forEach: this.forEach,
                    getField: this.getField,
                    getValue: this.getValue,
                    hasError: this.hasError,
                    hasField: this.hasField,
                    registerField: this.registerField,
                    setValue: this.setValue,
                    validate: this.validate,
                    validateField: this.validateField,
                    onSubmit: this.onSubmit,
                }
            }

            render() {
                return (
                    <FormContext.Provider value={this.form}>
                        <WrappedComponent {...this.props}/>
                    </FormContext.Provider>
                );
            }

            deregisterField = (field: field) => {
                if (!this.hasField(field.getFieldName(), field.getFieldIndex())) return;

                this.fields.get(field.getFieldName()).delete(field.getFieldIndex());
                if (this.fields.get(field.getFieldName()).size == 0) {
                    this.fields.delete(field.getFieldName());
                }
                this.forceUpdate();
            };

            forEach = (fn: (field?: field) => void): void => {
                for (let [name, fields] of this.fields) {
                    for (let [k, field] of fields) {
                        fn(field);
                    }
                }
            };

            getField = (k: string, i: number): field | void => {
                if (!this.hasField(k, i)) return;
                return this.fields.get(k).get(i);
            };

            getValue = (k: string): any => {
                if (!this.fields.has(k)) {
                    return undefined;
                }
                if (this.fields.get(k).size > 1) {
                    let col: Array<any> = [];
                    this.fields.get(k).forEach((sv, sk) => {
                        col[sk] = sv.getValue();
                    });
                    return col;
                }
                if (this.fields.get(k).size == 1) {
                    let col: any = undefined;
                    this.fields.get(k).forEach((sv) => {
                        col = sv.getValue();
                    });
                    return col;
                }

                return undefined;
            };

            hasError = (): boolean => {
                for (let [name, fields] of this.fields) {
                    for (let [k, field] of fields) {
                        if (field.hasError()) return true;
                    }
                }
                return false;
            };

            hasField(k: string, i: number) {
                if (!this.fields.has(k)) {
                    return false;
                }
                return this.fields.get(k).has(i);
            }

            registerField = (field: field) => {
                if (!this.fields.has(field.getFieldName())) {
                    this.fields.set(field.getFieldName(), new Map<number, field>());
                }
                this.fields.get(field.getFieldName()).set(field.getFieldIndex(), field);
                this.forceUpdate();
            };

            setValue = (k: string, i: number, v: any) => {
                if (!this.hasField(k, i)) return;
                this.fields.get(k).get(i).setValue(v);
            };

            validate = (): boolean => {
                this.forEach((field: field) => {
                    field.validate();
                });
                return !this.hasError();
            };

            validateField = (k: string, i: number) => {
                if (!this.hasField(k, i)) return false;
                return this.fields.get(k).get(i).validate();
            };

            onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO Implement
                console.log(e);
            }
        }
    }
};

function getDisplayName(WrappedComponent: React.ComponentClass<any>) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}