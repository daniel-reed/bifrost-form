import * as React from "react";

export function getDisplayName(WrappedComponent: React.ComponentClass<any>) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export interface IAbstractComponent {
    props: {[key: string]: any}
    forceUpdate: () => any
}

export class AbstractComponent implements IAbstractComponent {
    props: {[key: string]: any} = {};
    forceUpdate = () => {return;}
}