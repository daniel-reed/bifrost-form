import {IField} from "..";

export interface Validator {
    (value: any, field: IField): boolean | string;
}