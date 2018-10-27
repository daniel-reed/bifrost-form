import * as React from 'react'
import {Field} from "./Field";
import {FieldProps, withField} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";

export type UInputProps = React.HTMLProps<HTMLInputElement> & FieldProps

export class UTextInput extends React.Component<UInputProps> {
    render() {
        const { type, value, className, ...ptProps } = this.props;
        const cn = mergeClass(className, ["bifrost-field__input"]);
        const val = value ? value : "";
        return (
            <Field>
                <input type="text" className={cn} value={val} {...ptProps}/>
            </Field>
        );
    }
}

export const TextInput = withField<UInputProps>()(UTextInput);