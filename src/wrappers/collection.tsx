import * as React from 'react'
import {getDisplayName} from "./util";
import {Form, FormContext, IForm} from "./form";
import {Field, IField, IFieldType} from "./field";
import {Validator} from "../validation/validator";
import {FieldProps} from "./field";

export class Collection extends Field implements ICollection  {
    component: React.Component<any, any>;
    form: IForm;
    parent: IForm;
    type: IFieldType = IFieldType.Object;

    fieldOrder: number[] = [];

    constructor(component: React.Component<any, any>) {
        super(component);
        this.component = component;
        this.form = new Form(component);

        this.form.getNameFromField = function (field: IField): string {
            return 'collection';
        };

        this.form.deregisterField = function(field: IField) {
            // We are not removing fields once registered
            const index = this.getIndexFromField(field);
            if (!this.hasField(name, index)) return;
            delete this.fields.get(name)[index];
            this.component.forceUpdate();
        }.bind(this.form);
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
            <button onClick={this.handleAddClick}><i className="fas fa-plus"/></button>,
            <button onClick={this.handleRemoveClick}><i className="fas fa-minus"/></button>
        ];

        if (this.props.ordered) {
            buttons.push(
                <button onClick={this.handleMoveUpClick}><i className="fas fa-arrow-up"/></button>,
                <button onClick={this.handleMoveDownClick}><i className="fas fa-arrow-down"/></button>
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
                        fieldName: "collection",
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