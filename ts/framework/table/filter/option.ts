import { TableValue } from "../value";

export class FilterOption {
    private display: string;
    private value: any;

    public constructor(display: string, value: any) {
        this.display = display;
        this.value = value;
    }

    public get_display(): string {
        return this.display;
    }

    public get_value(): any {
        return this.value;
    }

    public filter_value(value: TableValue, field: string): boolean {
        return value.filter(field, this.value);
    }
}