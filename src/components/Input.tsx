import * as React from 'react';
import {Field} from "./Field";
import {FieldProps, asField, FieldContext, IField} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";

export type UInputProps = React.HTMLProps<HTMLInputElement> & FieldProps;

export class UTextInput extends React.Component<UInputProps> {
    static contextType = FieldContext;
    field: IField;

    constructor(props: any, context: IField) {
        super(props, context);
        this.field = context;
    }

    render() {
        let { type, value, className, ...ptProps } = this.props;
        if (ptProps['aria-describedby']) delete ptProps['aria-describedby'];
        if (ptProps['aria-invalid']) delete ptProps['aria-invalid'];
        const cn = mergeClass(className, ["bifrost-field__input"]);
        const val = value ? value : "";
        const invalid = typeof this.field.getError() !== 'undefined';
        return (
            <Field>
                <input type="text" className={cn} value={val} aria-describedby={this.field.getErrorId()} aria-invalid={invalid} {...ptProps}/>
            </Field>
        );
    }
}

export const TextInput = asField<UInputProps>()(UTextInput);