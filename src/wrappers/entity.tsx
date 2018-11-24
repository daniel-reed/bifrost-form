import * as React from 'react';
import {getDisplayName} from "./util";
import {FormController, FormContext, IForm} from "./form";
import {Field, IField, IFieldType} from "./field";
import {Validator} from "../validation/validator";

export class Entity extends Field implements IEntity  {
    component: React.Component<any, any>;
    form: IForm;
    parent: IForm;
    type: IFieldType = IFieldType.Object;

    constructor(component: React.Component<any, any>) {
        super(component);
        this.component = component;
        this.form = new FormController();
        this.form.setComponent(component);
        this.form.getFormName = function() {
            return this.parent.getFormName() + "_" + this.getFieldName();
        }.bind(this);
    }

    getForm = (): IForm => {
        return this.form;
    };

    setForm = (form: IForm, update: boolean = true): Entity => {
        this.form = form;
        if (update) this.component.forceUpdate();
        return this;
    };

    getParent = (): IForm => {
        return this.parent;
    };

    setParent = (parent: IForm, update: boolean = true): Entity => {
        this.parent = parent;
        if (update) this.component.forceUpdate();
        return this;
    };

    validate = (): boolean => {
        return this.form.validate();
    };

    hasError = (): boolean => {
        return this.form.hasError();
    };

    getValue = (): any => {
        return this.form.getFormValue();
    };

    // TODO Override setValue

    getValidators = (): Validator[] => {
        return this.form.getValidators();
    };

    addValidator = (validator: Validator, update: boolean = true): Entity => {
        this.form.addValidator(validator, update);
        return this;
    };

    removeValidator = (validator: Validator, update: boolean = true): Entity => {
        this.form.removeValidator(validator, update);
        return this;
    };

    getFormName = (): string => {
        return this.getParent().getFormName() + "_" + this.getFieldName();
    };

    setValueFromJson = (json: any, update: boolean = true): Field => {
        this.form.setFormValueFromJson(json);
        if (update) this.component.forceUpdate();
        return this;
    }
}

export interface IEntity extends IField {
    setParent(parent: IForm, update?: boolean): IEntity;
    getParent(): IForm;
    getForm(): IForm;
    setForm(form: IForm, update?: boolean): IEntity;
}

export type EntityProps = {
    fieldIndex?: number
    fieldName: string
};

export const asEntity = <T extends EntityProps>() => {
    return function (WrappedComponent: React.ComponentClass<T>): React.ComponentClass<T> {
        const defaultProps: Partial<EntityProps> = {
            fieldIndex: 0,
        };

        return class AsEntity extends React.Component<T> {
            static contextType = FormContext;
            static defaultProps: Partial<T> = defaultProps as Partial<T>;
            static displayName: string = `AsEntity(${getDisplayName(WrappedComponent)}`;
            static stripProps: Array<string> = [
                "fieldIndex",
                "fieldName",
            ];

            entity: IEntity;

            constructor(props: T, context: IForm) {
                super(props);
                this.entity = new Entity(this);
                this.entity.setParent(context, false);
                this.entity.setFieldName(props.fieldName, false);
                this.entity.setFieldIndex(props.fieldIndex, false);
                this.entity.getParent().registerField(this.entity);
            }

            render() {
                return (
                    <FormContext.Provider value={this.entity.getForm()}>
                        <WrappedComponent {...this.cleanProps()}/>
                    </FormContext.Provider>
                );
            }

            cleanProps = (): any  => {
                const ptProps = Object.assign({}, this.props as any);
                for (const k of AsEntity.stripProps) {
                    delete ptProps[k];
                }
                return ptProps;
            };

            componentWillUnmount() {
                this.entity.getParent().deregisterField(this.entity);
            }

            componentWillReceiveProps() {
                // TODO Make sure entity is up to date with props
            }
        }
    }
};