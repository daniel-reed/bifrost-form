import * as React from 'react'
import * as PropTypes from 'prop-types'
import {FieldContext} from "../wrappers/field";
import {mergeClass} from "./ClassHelpers";

export type Props = {
    bemElement?: string
}

export type ErrorProps = Props & React.HTMLProps<HTMLLabelElement>

export class Error extends React.Component<ErrorProps> {
    static contextTypes: object = {
        field: PropTypes.object.isRequired,
    };
    static defaultProps: Partial<ErrorProps> = {
        bemElement: "bifrost-field__error"
    };

    context: FieldContext;

    render() {
        if (!this.context.field.hasError()) {
            return null;
        }

        const { bemElement, className, ...ptProps } = this.props;
        const cn = mergeClass(className, [bemElement]);

        return (
            <label className={cn} {...ptProps}>
                {this.context.field.getError()}
            </label>
        );
    }
}