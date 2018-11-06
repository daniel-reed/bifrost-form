import * as React from 'react'
import {IField, FieldContext} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";
import {UErrorProps} from "./Error";

type Props = {
    bemElement?: string
}

export type ULabelProps = Props & React.HTMLProps<HTMLLabelElement>

export class Label extends React.Component<ULabelProps> {
    static contextType = FieldContext;
    static defaultProps: Partial<ULabelProps> = {
        bemElement: "bifrost-field__label"
    };

    field: IField;

    constructor(props: UErrorProps, context: IField) {
        super(props, context);
        this.field = context;
    }

    render() {
        const { bemElement, className, htmlFor, ...ptProps } = this.props;

        let classes = [bemElement];
        if (this.field.hasError()) {
            classes.push(`${bemElement}--error`)
        }
        const cn = mergeClass(className, classes);

        return (
            <label htmlFor={this.field.getHtmlName()} className={cn} {...ptProps}>
                {this.field.getLabel()}
            </label>
        );
    }
}