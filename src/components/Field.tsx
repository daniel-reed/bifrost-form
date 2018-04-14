import * as React from 'react'
import {Error} from './Error'
import {Label} from './Label'
import {mergeClass} from "./ClassHelpers";

export type Props = {
    bemElement?: string
}

export type FieldProps = Props & React.HTMLProps<HTMLDivElement>

export class Field extends React.Component<FieldProps> {
    static defaultProps: Partial<FieldProps> = {
        bemElement: "bifrost-field"
    };

    render() {
        const { bemElement, className, name, children, ...ptProps } = this.props;
        const cn = mergeClass(className, [bemElement]);

        return (
            <div className={cn} {...ptProps}>
                <Label/>
                {children}
                <Error/>
            </div>
        )
    }
}