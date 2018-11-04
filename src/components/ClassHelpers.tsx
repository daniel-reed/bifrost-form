function unique(value: string, index: number, self: Array<string>) {
    return self.indexOf(value) === index;
}

export function mergeClass(className: string | undefined, classes: Array<string>): string {
    if (typeof className === "undefined") className = "";
    return className.split(' ').concat(classes).filter(unique).join(" ").trim();
}