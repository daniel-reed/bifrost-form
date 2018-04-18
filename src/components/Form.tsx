import * as React from 'react'
import * as PropTypes from 'prop-types'
import {FormContext, FormProps as WFormProps, withForm} from "../wrappers/form";
import {mergeClass} from "./ClassHelpers";

export type FormProps = React.HTMLProps<HTMLFormElement> & WFormProps

export class UForm extends React.Component<FormProps> {
    static contextTypes = {
        form: PropTypes.object.isRequired
    };

    context: FormContext;

    render() {
        const { onSubmit, className, ...ptProps } = this.props;
        const cn = mergeClass(className, ["bifrost-form"]);
        return (
            <form className={cn} onSubmit={this.context.form.onSubmit} {...ptProps}/>
        );
    }
}

export const Form = withForm<FormProps>()(UForm);
