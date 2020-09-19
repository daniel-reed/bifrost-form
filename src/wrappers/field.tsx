import * as React from 'react'
import {IForm, FormContext} from "./form";
import {getDisplayName, IAbstractComponent} from "./util";
import {Validator} from "..";

export class Field implements IField {
    component: IAbstractComponent;
    defaultError: string = "Invalid Value";
    defaultValue: any;
    error?: string;
    fieldIndex: number = 0;
    fieldName: string;
    label: string;
    focus: boolean;
    type: IFieldType = IFieldType.String;
    validators: Validator[];
    value?: any;

    constructor(component: IAbstractComponent) {
        this.component = component;
        this.validators = [];
    }

    getDefaultError = (): string =>  {
        return this.defaultError;
    };

    setDefaultError = (error: string, update: boolean = true): Field => {
        this.defaultError = error;
        if (update) this.component.forceUpdate();
        return this;
    };

    getDefaultValue = (): any => {
        return this.defaultValue;
    };

    setDefaultValue = (value: any, update: boolean = true): Field => {
        this.value = value;
        if (update) this.component.forceUpdate();
        return this;
    };

    getError = (): string | undefined => {
        return this.hasError() ? this.error : undefined;
    };

    setError = (error: string, update: boolean = true): Field => {
        this.error = error;
        if (update) this.component.forceUpdate();
        return this;
    };

    getHtmlName = (): string => {
        return this.getFormName() + "_" + this.getFieldName();
    };

    getFieldName = (): string => {
        return this.fieldName;
    };

    setFieldName = (fieldName: string, update: boolean = true): Field => {
        this.fieldName = fieldName;
        if (update) this.component.forceUpdate();
        return this;
    };

    getFieldIndex = (): number => {
        return this.fieldIndex;
    };

    setFieldIndex = (fieldIndex: number, update: boolean = true): Field => {
        this.fieldIndex = fieldIndex;
        if (update) this.component.forceUpdate();
        return this;
    };

    getFocus = (): boolean => {
        return this.focus;
    };

    setFocus = (focus: boolean, update: boolean = true): Field => {
        this.focus = focus;
        if (update) this.component.forceUpdate();
        return this;
    };

    getFormName = (): string => {
        return '';
    };

    getLabel = (): string => {
        return this.component.props.label;
    };

    setLabel = (label: string, update: boolean = true): Field => {
        this.label = label;
        if (update) this.component.forceUpdate();
        return this;
    };

    hasError = (): boolean => {
        return this.error !== undefined
    };

    getErrorId = (): string => {
        return ([
            this.getFormName(),
            this.getFieldName(),
            this.getFieldIndex(),
            "error"
        ]).join("_");
    };

    validate = (v?: any, update: boolean = true): boolean => {
        for (let i = 0; i < this.validators.length; i++) {
            let result = this.validators[i](this.value, this);
            if (typeof result === "string") {
                this.error = result;
                break;
            }
            if (!result) {
                this.error = this.defaultError;
                break;
            }
            if (result) {
                this.error = undefined;
            }
        }
        if (update) this.component.forceUpdate();
        return this.error === undefined;
    };

    getType = (): IFieldType => {
        return this.type;
    };

    setType = (type: IFieldType, update: boolean = true): IField => {
        this.type = type;
        if (update) this.component.forceUpdate();
        return this;
    };

    getValidators = (): Validator[] => {
        return this.validators;
    };

    addValidator = (validator: Validator, update: boolean = true): Field => {
        this.validators.push(validator);
        if (update) this.component.forceUpdate();
        return this;
    };

    removeValidator = (validator: Validator, update: boolean = true): Field => {
        const index = this.validators.indexOf(validator);
        if (index === -1) return;
        this.validators.splice(index, 1);
        if (update) this.component.forceUpdate();
        return this;
    };

    getValue = (): any => {
        return this.value;
    };

    setValue = (v?: any, update: boolean = true): Field => {
        this.value = v;
        if (update) this.component.forceUpdate();
        return this;
    };

    setValueFromJson = (json: any, update: boolean = true): Field => {
        this.value = json;
        if (update) this.component.forceUpdate();
        return this;
    }
}

export enum IFieldType {
    Object = "object",
    Array = "array",
    String = "string",
    Collection = "collection",
}

export interface IField {
    getDefaultError(): any;
    setDefaultError(error: string, update?: boolean): IField;
    getDefaultValue(): any;
    setDefaultValue(val: any, update?: boolean): IField;
    getError(): string | undefined;
    setError(error: string, update?: boolean): IField;
    getErrorId(): string;
    getHtmlName(): string;
    getFieldName(): string;
    setFieldName(fieldName: string, update?: boolean): IField;
    getFormName(): string;
    getFieldIndex(): number;
    setFieldIndex(fieldIndex: number, update?: boolean): IField;
    getFocus(): boolean;
    setFocus(focus: boolean, update?: boolean): IField;
    getLabel(): string;
    setLabel(label: string, update?: boolean): IField;
    getType(): IFieldType;
    setType(type: IFieldType, update?: boolean): IField;
    getValidators(): Validator[];
    addValidator(validator: Validator, update?: boolean): IField;
    removeValidator(validator: Validator, update?: boolean): IField;
    getValue(): any;
    setValue(v: any, update?: boolean): IField;
    setValueFromJson(json: any, update?: boolean): IField
    hasError(): boolean;
    validate(v?: any, update?: boolean): boolean;
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

export const FieldContext = React.createContext({});

export const asField = <T extends FieldProps>() => {
    return function (WrappedComponent: React.ComponentClass<T>): React.ComponentClass<T> {
        const defaultProps: Partial<FieldProps> = {
            defaultError: "Invalid Value",
            fieldIndex: 0,
            validators: [],
        };

        class AsField extends React.Component<T> {
            static contextType = FormContext;
            static defaultProps: Partial<T> = defaultProps as Partial<T>;
            static displayName: string = `AsField(${getDisplayName(WrappedComponent)})`;
            static stripProps: Array<string> = [
                "defaultError",
                "defaultValue",
                "fieldIndex",
                "fieldName",
                "label",
                "validators"
            ];

            form: IForm;
            field: IField;
            orideProps: Partial<FieldProps>;

            constructor(props: T, context: IForm) {
                super(props, context);
                this.orideProps = {
                    onChange: this.handleChange,
                    onBlur: this.handleBlur,
                    onFocus: this.handleFocus,
                };
                this.form = context;
                this.field = new Field(this);
                this.field.setDefaultValue(props.defaultValue, false);
                this.field.setDefaultError(props.defaultError, false);
                this.field.setFieldIndex(props.fieldIndex, false);
                this.field.setFieldName(props.fieldName, false);
                this.field.getFormName = this.form.getFormName;
                if (props.validators) {
                    for (const validator of props.validators) {
                        this.field.addValidator(validator, false);
                    }
                }
                // TODO This should be valuer rather than defaultValue?
                this.field.setValue(props.defaultValue, false);
                this.field.setLabel(props.label, false);

                this.form.registerField(this.field);
            }

            render() {
                return (
                    <FieldContext.Provider value={this.field}>
                        <WrappedComponent {...this.cleanProps()}/>
                    </FieldContext.Provider>
                );
            }

            cleanProps = (): any => {
                const ptProps = Object.assign({}, this.props as any, this.orideProps);
                ptProps.value = this.field.getValue();
                ptProps.name = this.field.getHtmlName();
                for (const k of AsField.stripProps) {
                    delete ptProps[k];
                }
                return ptProps;
            };

            componentWillUnmount() {
                this.form.deregisterField(this.field);
            }

            componentWillReceiveProps() {
                // TODO Make sure field is up to date with props.
            }

            handleChange = (event: React.ChangeEvent<any>): void => {
                this.field.setValue(event.target.value, false);
                if (this.field.getError() !== undefined) this.field.validate();
                this.forceUpdate();
                if (typeof this.props.onChange === 'function') {
                    this.props.onChange(event);
                }
            };

            handleFocus = (event: React.FocusEvent<any>): void => {
                this.field.setFocus(true, false);
                this.forceUpdate();
                if (typeof this.props.onFocus === 'function') {
                    this.props.onFocus(event)
                }
            };

            handleBlur = (event: React.FocusEvent<any>): void => {
                this.field.setFocus(false, false);
                this.field.validate(undefined, false);
                this.forceUpdate();
                if (typeof this.props.onBlur === 'function') {
                    this.props.onBlur(event)
                }
            };
        }
        return AsField
    }
};