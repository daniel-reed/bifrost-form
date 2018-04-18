import * as React from 'react'
import * as PropTypes from 'prop-types'
import {FormContext} from "./form";

export interface field {
    getError(): string;
    getFieldName(): string;
    getFieldIndex(): number;
    getFocus(): boolean;
    getLabel(): string;
    getValue(): any;
    hasError(): boolean;
    setValue(v: any): void;
    validate(v?: any): boolean;
}

export interface Validator {
    (value: any, field: field): boolean | string;
}

export type Event = {
    currentTarget: {
        value: any
    }
}

export type FieldContext = {
    field: field
}

export type FieldProps = {
    defaultError?: string
    defaultValue?: any
    fieldIndex?: number
    fieldName: string
    label: string
    validators?: Array<Validator>
    onChange?: (event: React.ChangeEvent<any>) => void
    onBlur?: (event: React.FocusEvent<any>) => void
    onFocus?: (event: React.FocusEvent<any>) => void
    value?: any
}

export const withField = <T extends FieldProps>() => {
    return function (WrappedComponent: React.ComponentClass<T>): React.ComponentClass<T> {
        const defaultProps: Partial<FieldProps> = {
            defaultError: "Invalid Value",
            fieldIndex: 0,
            validators: [],
        };

        class WithField extends React.Component<T> implements field {

            static childContextTypes: object = { field: PropTypes.object.isRequired };
            static contextTypes: object = {
                form: PropTypes.object.isRequired,
            };
            static defaultProps: Partial<T> = defaultProps as Partial<T>;
            static displayName: string = `WithField(${getDisplayName(WrappedComponent)})`;
            static stripProps: Array<string> = [
                "defaultError",
                "defaultValue",
                "fieldIndex",
                "fieldName",
                "label",
                "validators"
            ];

            context: FormContext;
            error?: string;
            focus: boolean;
            orideProps: Partial<FieldProps>;
            value?: any;

            getChildContext(): FieldContext {
                const field: field = {
                    getError: this.getError,
                    getFieldName: this.getFieldName,
                    getFieldIndex: this.getFieldIndex,
                    getFocus: this.getFocus,
                    getLabel: this.getLabel,
                    getValue: this.getValue,
                    hasError: this.hasError,
                    setValue: this.setValue,
                    validate: this.validate,
                };
                const context: FieldContext = {
                    field: field
                };
                return context
            }

            constructor(props: T, context: FormContext) {
                super(props);
                this.value = props.defaultValue;
                this.orideProps = {
                    onChange: this.handleChange,
                    onBlur: this.handleBlur,
                    onFocus: this.handleFocus,
                };
                context.form.registerField(this);
            }

            render() {
                return <WrappedComponent {...this.cleanProps()}/>;
            }

            componentWillUnmount() {
                this.context.form.deregisterField(this);
            }

            cleanProps = (): any  => {
                const ptProps = Object.assign({}, this.props as any, this.orideProps);
                ptProps.value = this.value;
                for (const k of WithField.stripProps) {
                    delete ptProps[k];
                }
                return ptProps;
            };

            getError = (): string => {
                return this.hasError() ? this.error : "";
            };

            getFieldName = (): string => {
                return this.props.fieldName;
            };

            getFieldIndex = (): number => {
                return this.props.fieldIndex;
            };

            getFocus = (): boolean => {
                return this.focus;
            };

            getLabel = (): string => {
                return this.props.label;
            };

            hasError = (): boolean => {
                return this.error !== undefined
            };

            validate = (): boolean => {
                for (let i = 0; i < this.props.validators.length; i++) {
                    let result = this.props.validators[i](this.value, this);
                    if (typeof result === "string") {
                        this.error = result;
                        break;
                    }
                    if (!result) {
                        this.error = this.props.defaultError;
                        break;
                    }
                    if (result) {
                        this.error = undefined;
                    }
                }
                this.forceUpdate();
                return this.error === undefined;
            };

            handleChange = (event: React.ChangeEvent<any>): void => {
                this.setValue(event.target.value);
                if (this.error !== undefined) this.validate();
                if (typeof this.props.onChange === 'function') {
                    this.props.onChange(event);
                }
            };

            handleFocus = (event: React.FocusEvent<any>): void => {
                this.focus = true;
                this.forceUpdate();
                if (typeof this.props.onFocus === 'function') {
                    this.props.onFocus(event)
                }
            };

            handleBlur = (event: React.FocusEvent<any>): void => {
                this.focus = false;
                this.validate();
                if (typeof this.props.onBlur === 'function') {
                    this.props.onFocus(event)
                }
            };

            getValue = (): any => {
                return this.value;
            };

            setValue = (v?: any) => {
                this.value = v;
                this.forceUpdate();
            }
        }
        return WithField
    }
};

function getDisplayName(WrappedComponent: React.ComponentClass<any>) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}