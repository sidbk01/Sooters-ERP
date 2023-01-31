import { TableValue } from "../value";

export class FilterOption {
    private display: string;
    private value: any;
    private initial: boolean;

    public constructor(display: string, value: any, initial = true) {
        this.display = display;
        this.value = value;
        this.initial = initial;
    }

    public get_display(): string {
        return this.display;
    }

    public get_value(): any {
        return this.value;
    }

    public is_initial(): boolean {
        return this.initial;
    }

    public filter_value(value: TableValue, field: string): boolean {
        return value.filter(field, this.value);
    }
}