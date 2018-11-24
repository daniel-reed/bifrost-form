import * as React from 'react'
import {IForm, FormContext, FormProps, asForm} from "../wrappers/form";
import {mergeClass} from "./ClassHelpers";

export type UFormProps = React.HTMLProps<HTMLFormElement> & FormProps

export class UForm extends React.Component<UFormProps> {
    static contextType = FormContext;
    form: IForm;

    constructor(props: UFormProps, context: IForm) {
        super(props, context);
        this.form = context;
    }

    render() {
        const { className, ...ptProps } = this.props;
        const cn = mergeClass(className, ["bifrost-form"]);
        return (
            <form className={cn} {...ptProps}/>
        );
    }
}

export const Form = asForm<UFormProps>()(UForm);
