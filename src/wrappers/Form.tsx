import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Field} from "./Field";

export interface Form {
    deregisterField(field: Field): void;
    getField(k: string, i: number): Field | void
    getValue(k: string): any
    hasError(): boolean
    hasField(k: string, i: number): boolean
    registerField(field: Field): void;
    setValue(k: string, i: number, v:any): void
    validate(): boolean;
    validateField(k: string, i: number): boolean;
}

export function withForm() {
    return function (WrappedComponent: React.ComponentClass) {
        class WithForm extends React.Component<{}> implements Form {
            static childContextTypes: object = { form: PropTypes.object.isRequired };
            static displayName: string = `WithDevice(${getDisplayName(WrappedComponent)})`;
            fields: Map<string, Map<number, Field>> = new Map();

            constructor(props: {}) {
                super(props);
            }

            render() {
                return <WrappedComponent/>;
            }

            deregisterField = (field: Field) => {
                if (!this.hasField(field.getFieldName(), field.getFieldIndex())) return;

                this.fields.get(field.getFieldName()).delete(field.getFieldIndex());
                if (this.fields.get(field.getFieldName()).size == 0) {
                    this.fields.delete(field.getFieldName());
                }
                this.forceUpdate();
            };

            getField = (k: string, i: number): Field | void => {
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

            hasError = () => {
                // TODO
                return false;
            };

            hasField(k: string, i: number) {
                if (!this.fields.has(k)) {
                    return false;
                }
                return this.fields.get(k).has(i);
            }

            registerField = (field: Field) => {
                if (!this.fields.has(field.getFieldName())) {
                    this.fields.set(field.getFieldName(), new Map<number, Field>());
                }
                this.fields.get(field.getFieldName()).set(field.getFieldIndex(), field);
                this.forceUpdate();
            };

            setValue = (k: string, i: number, v: any) => {
                if (!this.hasField(k, i)) return;
                this.fields.get(k).get(i).setValue(v);
            };

            validate = () => {
                // TODO
                return true;
            };

            validateField = (k: string, i: number) => {
                if (!this.hasField(k, i)) return false;
                return this.fields.get(k).get(i).validate();
            };
        }
    }
}

function getDisplayName(WrappedComponent: React.ComponentClass) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}