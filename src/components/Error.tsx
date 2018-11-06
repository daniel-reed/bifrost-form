import * as React from 'react'
import {IField, FieldContext} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";

type Props = {
    bemElement?: string
}

export type UErrorProps = Props & React.HTMLProps<HTMLLabelElement>

export class Error extends React.Component<UErrorProps> {
    static contextType = FieldContext;
    static defaultProps: Partial<UErrorProps> = {
        bemElement: "bifrost-field__error"
    };
    field: IField;

    constructor(props: UErrorProps, context: IField) {
        super(props, context);
        this.field = context;
    }

    render() {
        const { bemElement, className, id, ...ptProps } = this.props;
        const cn = mergeClass(className, [bemElement]);

        return (
            <span id={this.field.getErrorId()} className={cn} {...ptProps} role="alert">
                {this.field.getError()}
            </span>
        );
    }
}