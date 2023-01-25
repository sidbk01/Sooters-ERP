import { TableColumn } from "./table";

export interface TableBuilder<T extends TableValue> {
    get_columns(): TableColumn[];
    get_values(): T[];
}

export interface TableValue {
    render_field(field: string): Promise<HTMLElement | string>;
    generate_on_click(): string;
}