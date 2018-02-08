import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Form} from "./Form";

export interface Field {
    getFieldName(): string;
    getFieldIndex(): number;
    getValue(): any;
    setValue(v: any): void;
    validate(v?: any): boolean;
}

export interface Validator {
    (value: any, field: Field): boolean | string;
}

export type Event = {
    currentTarget: {
        value: any
    }
}

type Props = {
    defaultError: string
    defaultValue: any
    fieldIndex: number
    fieldName: string
    validators: Array<Validator>
}

type ContextTypes = {
    form: Form
}

export function withField() {
    return function (WrappedComponent: React.ComponentClass) {
        class WithField extends React.Component<Props> implements Field {
            static displayName: string = `WithDevice(${getDisplayName(WrappedComponent)})`;
            static defaultProps: Partial<Props> = {
                defaultError: "Invalid Value",
                fieldIndex: 0
            };
            static contextTypes = {
                form: PropTypes.object.isRequired,
            };

            context: ContextTypes;
            value?: any;
            error?: string;
            focus: boolean;

            constructor(props: Props, context: ContextTypes) {
                super(props);
                this.value = props.defaultValue;
                context.form.registerField(this);
            }

            render() {
                return <WrappedComponent/>;
            }

            componentWillUnmount() {
                this.context.form.deregisterField(this);
            }

            getFieldName = () => {
                return this.props.fieldName;
            };

            getFieldIndex = () => {
                return this.props.fieldIndex;
            };

            validate = (): boolean => {
                for (let i = 0; i < this.props.validators.length; i++) {
                    let result = this.props.validators[i](this.value, this);
                    if (typeof result === "string") {
                        this.error = result;
                        break;
                    }
                    if (typeof result === "boolean" && !result) {
                        this.error = this.props.defaultError;
                        break;
                    }
                    if (typeof result === "boolean" && result) {
                        this.error = undefined;
                    }
                }
                this.forceUpdate();
                return this.error === undefined;
            };

            handleChange = (event: Event) => {
                this.setValue(event.currentTarget.value);
                if (this.error !== undefined) this.validate();
            };

            handleFocus = () => {
                this.focus = true;
                this.forceUpdate();
            };

            handleBlur = () => {
                this.focus = false;
                this.validate();
            };

            getValue = () => {
                return this.value;
            };

            setValue = (v?: any) => {
                this.value = v;
                this.forceUpdate();
            }
        }

    }
}

function getDisplayName(WrappedComponent: React.ComponentClass) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}