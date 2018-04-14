import * as React from 'react'
import {Field} from "./Field";
import {FieldProps, withField} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";

export type InputProps = React.HTMLProps<HTMLInputElement> & FieldProps

export class UTextInput extends React.Component<InputProps> {
    render() {
        const { type, className, ...ptProps } = this.props;
        const cn = mergeClass(className, ["bifrost-field__input"]);
        return (
            <Field>
                <input type="text" className={cn} {...ptProps}/>
            </Field>
        )
    }
}

export const TextInput = withField<InputProps>()(UTextInput);