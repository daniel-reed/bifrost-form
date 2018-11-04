import * as React from 'react'
import {EntityProps, asEntity} from "../wrappers/entity";
import {mergeClass} from "./ClassHelpers";

export type UEntityProps = React.HTMLProps<HTMLDivElement> & EntityProps

export class UEntity extends React.Component<UEntityProps> {

    constructor(props: UEntityProps) {
        super(props);
    }

    render() {
        const { className, ...ptProps } = this.props;
        const cn = mergeClass(className, ["bifrost-form-entity"]);
        return (
            <div className={cn} {...ptProps}/>
        );
    }
}

export const Entity = asEntity<UEntityProps>()(UEntity);