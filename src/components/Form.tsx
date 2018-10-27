import * as React from 'react'
import {form, FormContext, FormProps, withForm} from "../wrappers/form";
import {mergeClass} from "./ClassHelpers";

export type UFormProps = React.HTMLProps<HTMLFormElement> & FormProps

export class UForm extends React.Component<UFormProps> {
    static contextType = FormContext;
    form: form;

    constructor(props: FormProps, context: form) {
        super(props, context);
        this.form = context;
    }

    render() {
        const { onSubmit, className, ...ptProps } = this.props;
        const cn = mergeClass(className, ["bifrost-form"]);
        return (
            <form className={cn} onSubmit={this.form.onSubmit} {...ptProps}/>
        );
    }
}

export const Form = withForm<UFormProps>()(UForm);
