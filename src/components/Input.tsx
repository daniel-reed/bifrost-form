import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Field} from "./Field";
import {FieldContext, FieldProps, withField} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";

export type InputProps = React.HTMLProps<HTMLInputElement> & FieldProps

export class UTextInput extends React.Component<InputProps> {
    static contextTypes = {
        field: PropTypes.object.isRequired
    };

    context: FieldContext;

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

export const TextInput = withField<InputProps>()(UTextInput);