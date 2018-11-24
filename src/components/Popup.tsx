import * as React from 'react';
import {Field} from "./Field";
import {FieldProps, asField, FieldContext, IField} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";
import {IForm} from "..";
import {SubmitHandler} from "../wrappers/form";
import {ChangeEvent} from "react";

export type UPopupProps = React.HTMLProps<HTMLInputElement> & FieldProps & {
    buttonLabel?: string | React.Component,
    defaultDisplay?: string,
    onDisplay?: (val: any) => string,
    url: string,
};

export type UPopupState = {
    display: string
}

export class UPopupInput extends React.Component<UPopupProps, UPopupState> {
    static contextType = FieldContext;
    static defaultProps: Partial<UPopupProps> = {
        buttonLabel: "Edit",
        defaultDisplay: "Click Edit To Begin...",
        onDisplay: (val: any) => { return "Value Set"}
    };
    static popupParams = "toolbar=no,menubar=no";
    field: IField;

    constructor(props: any, context: IField) {
        super(props, context);
        this.field = context;
        this.state = {display: props.defaultDisplay};
    }

    render() {
        let { value, className, onChange, readOnly, ...ptProps } = this.props;
        const cn = mergeClass(className, ["bifrost-field__popup"]);
        const val = value ? value : "";
        const invalid = typeof this.field.getError() !== 'undefined';
        return (
            <Field>
                <input type="text" className={cn} value={this.props.onDisplay(val)} aria-describedby={this.field.getErrorId()} aria-invalid={invalid} readOnly={true} onChange={this.ignoreChange}/>
                <button onClick={this.handlePopupClick}>{this.props.buttonLabel}</button>
            </Field>
        )
    }

    ignoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    handlePopupClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const handleMessage = ((e: MessageEvent) => {
            window.removeEventListener("message", handleMessage);
            // TODO Handle parse failure gracefully
            const message = JSON.parse(e.data);
            this.props.onChange({target: {value: message.value}} as ChangeEvent<any>);
        }).bind(this);
        // TODO Prevent multiple popups
        // TODO Remove event listener on unmount and window close
        // TODO Determine Channel format
        window.addEventListener("message", handleMessage);
        // TODO Give the window a name which includes the unique form identifier
        // TODO Save reference to close on unmount or submission as necessary
        window.open(this.props.url, undefined, UPopupInput.popupParams);
    }
}

export const PopupInput = asField<UPopupProps>()(UPopupInput);
export type DisplayHandler = (form: IForm) => string;


export const parentSubmitHandler = (e: React.FormEvent<HTMLFormElement>, form: IForm) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO Error Checking
    if (window.opener) {
        const message = {
            value: form.getFormValue()
        };
        window.opener.postMessage(JSON.stringify(message), '*');
    }
    window.close();
};
