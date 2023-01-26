import { TableColumn } from "./column";
import { TableValue } from "./value";

export interface TableBuilder<T extends TableValue> {
    get_columns(): Promise<TableColumn[]>;
    get_values(): T[];
}