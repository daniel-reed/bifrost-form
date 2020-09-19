import * as React from 'react'
import {getDisplayName} from "./util";
import {FormController, FormContext, IForm} from "./form";
import {Field, IField, IFieldType} from "./field";
import {Validator} from "..";
import {FieldProps} from "./field";
import {AbstractComponent} from "./util";

export class Collection extends Field implements ICollection  {
    component: React.Component<any, any>;
    form: IForm;
    parent: IForm;
    type: IFieldType = IFieldType.Collection;

    fieldOrder: number[] = [];

    constructor(component: React.Component<any, any>) {
        super(component);
        const collection = this;
        const form = new FormController();
        this.component = component;
        this.form = form;
        this.form.setComponent(component);

        this.form.getNameFromField = function (): string {
            return 'collection';
        }.bind(this.form);

        this.form.getFormName = function(): string {
            return collection.parent.getFormName() + "_" + collection.getFieldName();
        }.bind(form);

        this.form.deregisterField = function(field: IField) {
            // We are deleting fields (setting to undefined)
            // but not removing them from the map when deregistered.
            // This simplifies our keys
            const index = form.getIndexFromField(field);
            if (!form.hasField(name, index)) return;
            delete form.fields.get(name)[index];
            form.component.forceUpdate();
        }.bind(form);

        this.form.setFormValueFromJson = function (json: any): FormController {
            if (!Array.isArray(json)) return form;
            if (!form.fields.has('collection')) {
                form.fields.set('collection', []);
            }
            collection.fieldOrder = [];
            for (let i = 0; i < json.length; i++) {
                let insertAt = form.fields.get('collection').length;
                collection.fieldOrder.push(insertAt);
                // We use an AbstractComponent to store the value and allow
                // the actual field (after re-render) inherit the value from
                // the AbstractComponent
                let field = new Field(new AbstractComponent());
                field.setValueFromJson(json[i]);
                form.fields.get('collection')[insertAt] = field;
            }
            form.component.forceUpdate();
        }.bind(form);

        this.form.forEach = function(fn: (field?: IField) => any): void {
            for (const fieldIndex of collection.fieldOrder) {
                const fields = form.getFields('collection');
                if (!fields) break;
                const field = fields[fieldIndex];
                if (!field) continue;
                fn(field)
            }
        }.bind(form);

        this.form.hasError = function (): boolean {
            for (const fieldIndex of collection.fieldOrder) {
                const fields = form.getFields('collection');
                if (!fields) break;
                const field = fields[fieldIndex];
                if (!field) continue;
                if (field.hasError()) return true;
            }
            return false;
        }.bind(collection);
    }

    getForm = (): IForm => {
        return this.form;
    };

    setForm = (form: IForm, update: boolean = true): Collection => {
        this.form = form;
        if (update) this.component.forceUpdate();
        return this;
    };

    getParent = (): IForm => {
        return this.parent;
    };

    setParent = (parent: IForm, update: boolean = true): Collection => {
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
        const collection = Array(this.fieldOrder.length);
        const formvalue = this.form.getFormValue()['collection'] || [];
        for (const [index, fieldIndex] of this.fieldOrder.entries()) {
            collection[index] = formvalue[fieldIndex];
        }
        return collection;
    };

    // TODO Override setValue

    getValidators = (): Validator[] => {
        return this.form.getValidators();
    };

    addValidator = (validator: Validator, update: boolean = true): Collection => {
        this.form.addValidator(validator, update);
        return this;
    };

    removeValidator = (validator: Validator, update: boolean = true): Collection => {
        this.form.removeValidator(validator, update);
        return this;
    };

    getFieldOrder = (): number[] => {
        return this.fieldOrder;
    };

    getFieldPosition = (fieldIndex: number): number => {
        return this.fieldOrder.indexOf(fieldIndex);
    };

    insertField = (fieldNumber: number, at: number, update: boolean = true): Collection => {
        if (at >= this.fieldOrder.length) {
            this.fieldOrder.push(fieldNumber)
        } else {
            this.fieldOrder.splice(at, 0, fieldNumber);
        }
        if (update) this.component.forceUpdate();
        return this;
    };

    moveField = (from: number, to: number, update: boolean = true): Collection => {
        // Remove target from array
        console.log(from);
        const temp = this.fieldOrder.splice(from, 1);
        console.log(to);
        // Add removed target to specified position
        this.fieldOrder.splice(to, 0, temp[0]);
        if (update) this.component.forceUpdate();
        return this;
    };

    removeField = (fieldIndex: number, update: boolean = true): Collection => {
        const index = this.fieldOrder.indexOf(fieldIndex);
        this.fieldOrder.splice(index, 1);
        if (update) this.component.forceUpdate();
        return this;
    };

    addField = (at?: number, update: boolean = true): Collection => {
        const fields = this.form.getFields('collection');
        let fieldsCount = 0;
        if (fields) {
            fieldsCount = fields.length;
        }
        at = at || fieldsCount;
        this.insertField(fieldsCount, at);
        if (update) this.component.forceUpdate();
        return this;
    };

    setValueFromJson = (json: any, update: boolean = true): Field => {
        this.form.setFormValueFromJson(json);
        if (update) this.component.forceUpdate();
        return this;
    }
}

export interface ICollection extends IField {
    setParent(parent: IForm, update?: boolean): ICollection;
    getParent(): IForm;
    getForm(): IForm;
    setForm(form: IForm, update?: boolean): ICollection;
    getFieldOrder(): number[];
    getFieldPosition(fieldNumber: number): number;
    insertField(fieldNumber: number, at: number, update?: boolean): ICollection;
    moveField(from: number, to: number, update?: boolean): ICollection;
    removeField(fieldIndex: number, update?: boolean): ICollection;
    addField(at?: number, update?: boolean): ICollection;
}

export type CollectionProps = {
    field: React.ComponentClass<FieldProps>;
    fieldIndex?: number;
    fieldLabel: string;
    fieldName: string;
    fieldProps?: Partial<FieldProps>;
    ordered?: boolean
    onAddClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export type ItemContainerProps = {
    fieldIndex: number;
    fieldPos: number;
    collection: ICollection;
    ordered: boolean;
}

export class ItemContainer extends React.Component<ItemContainerProps> {
    render() {
        let buttons = [
            <button key="add" onClick={this.handleAddClick}><i className="fas fa-plus"/></button>,
            <button key="remove" onClick={this.handleRemoveClick}><i className="fas fa-minus"/></button>
        ];

        if (this.props.ordered) {
            buttons.push(
                <button key="up" onClick={this.handleMoveUpClick}><i className="fas fa-arrow-up"/></button>,
                <button key="down" onClick={this.handleMoveDownClick}><i className="fas fa-arrow-down"/></button>
            );
        }

        return (
            <div className="bifrost-collection-item">
                <div className="bifrost-collection-item-field">
                    {this.props.children}
                </div>
                <div className="bifrost-collection-item-controls">
                    {buttons}
                </div>
            </div>
        );
    }

    handleAddClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        this.props.collection.addField();
    };

    handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        this.props.collection.removeField(this.props.fieldIndex);
    };

    handleMoveUpClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const from = this.props.fieldPos;
        const to = from - 1;
        if (to < 0) return;
        this.props.collection.moveField(from, to);
    };

    handleMoveDownClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const from = this.props.fieldPos;
        const to = from + 1;
        if (to >= this.props.collection.getFieldOrder().length) return;
        this.props.collection.moveField(from, to);
    };
}

export const asCollection = <T extends CollectionProps>() => {
    return function (WrappedComponent: React.ComponentClass<T>): React.ComponentClass<T> {
        const defaultProps: Partial<CollectionProps> = {
            fieldIndex: 0,
            ordered: true
        };

        return class AsCollection extends React.Component<T> {
            static contextType = FormContext;
            static defaultProps: Partial<T> = defaultProps as Partial<T>;
            static displayName: string = `AsCollection(${getDisplayName(WrappedComponent)}`;
            static stripProps: Array<string> = [
                "field",
                "fieldIndex",
                "fieldLabel",
                "fieldName",
                "fieldProps",
                "onAddClick",
            ];

            collection: ICollection;

            constructor(props: T, context: IForm) {
                super(props);

                this.collection = new Collection(this);
                this.collection.setParent(context, false);
                this.collection.setFieldName(props.fieldName, false);
                this.collection.setFieldIndex(props.fieldIndex, false);
                this.collection.getParent().registerField(this.collection);
            }

            render() {
                // Allow multiple instances of WrappedComponent
                // Render collection controls (Add, Remove, Move Up, Move Down)
                // Allow ordered vs not-ordered collections
                let items = [];
                const ItemField: React.ComponentClass<FieldProps> = this.props.field;

                for (let [pos, fieldIndex] of this.collection.getFieldOrder().entries()) {
                    let props: FieldProps = Object.assign({}, this.props.fieldProps || {}, {
                        fieldName: "" + fieldIndex,
                        fieldIndex: fieldIndex,
                        label: this.props.fieldLabel,
                    });
                    items.push(
                        <ItemContainer key={fieldIndex} fieldIndex={fieldIndex} fieldPos={pos} collection={this.collection} ordered={this.props.ordered}>
                            <ItemField {...props}/>
                        </ItemContainer>
                    )
                }

                return (
                    <FormContext.Provider value={this.collection.getForm()}>
                        <WrappedComponent {...this.cleanProps()} onAddClick={this.handleAddClick}>
                            {items}
                        </WrappedComponent>
                    </FormContext.Provider>
                );
            }

            cleanProps = (): any  => {
                const ptProps = Object.assign({}, this.props as any);
                for (const k of AsCollection.stripProps) {
                    delete ptProps[k];
                }
                return ptProps;
            };

            componentWillUnmount() {
                this.collection.getParent().deregisterField(this.collection);
            }

            componentWillReceiveProps() {
                // TODO Make sure entity is up to date with props
            }

            handleAddClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
                e.preventDefault();
                this.collection.addField();
            };
        }
    }
};