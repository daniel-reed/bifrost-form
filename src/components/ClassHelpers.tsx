import {string} from "prop-types";

function unique(value: string, index: number, self: Array<string>) {
    return self.indexOf(value) === index;
}

export function mergeClass(className: string, classes: Array<string>): string {
    return className.split(' ').concat(classes).filter(unique).join(" ");
}