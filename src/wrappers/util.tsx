import * as React from "react";

export function getDisplayName(WrappedComponent: React.ComponentClass<any>) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}