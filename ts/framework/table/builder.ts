import { TableColumn } from "./column";
import { ExtraFilterInput, FilterOption } from "./index";
import { TableValue } from "./value";

export interface TableBuilder<T extends TableValue> {
    get_columns(): Promise<TableColumn[]>;
    get_values(): T[];

    get_extra_filter_input(): Promise<ExtraFilterInput | undefined>;
}