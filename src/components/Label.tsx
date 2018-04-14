import * as React from 'react'
import * as PropTypes from 'prop-types'
import {FieldContext} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";

export type Props = {
    bemElement?: string
}

export type LabelProps = Props & React.HTMLProps<HTMLLabelElement>

export class Label extends React.Component<LabelProps> {
    static contextTypes: object = {
        field: PropTypes.object.isRequired,
    };
    static defaultProps: Partial<LabelProps> = {
        bemElement: "bifrost-field__label"
    };

    context: FieldContext;

    render() {
        const { bemElement, className, ...ptProps } = this.props;

        let classes = [bemElement];
        if (this.context.field.hasError()) {
            classes.push(`${bemElement}--error`)
        }
        const cn = mergeClass(className, classes);

        return (
            <label className={cn} {...ptProps}>
                {this.context.field.getLabel()}
            </label>
        );
    }
}