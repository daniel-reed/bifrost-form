import * as React from 'react'
import {FormContext} from "../wrappers/form";
import {mergeClass} from "./ClassHelpers";
import {asCollection, CollectionProps} from "../wrappers/collection";

export type UCollectionProps = React.HTMLProps<HTMLDivElement> & CollectionProps

export class UCollection extends React.Component<UCollectionProps> {
    static contextType = FormContext;

    constructor(props: UCollectionProps) {
        super(props);
    }

    render() {
        const { className, children, onAddClick, label, ...ptProps } = this.props;
        const cn = mergeClass(className, ["bifrost-form-collection"]);
        return (
            <div className={cn} {...ptProps}>
                {children}
                <button onClick={onAddClick}>Add Item</button>
            </div>
        )
    }
}

export const Collection = asCollection<UCollectionProps>()(UCollection);