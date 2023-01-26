import { TableBody } from "./body";
import { Filter } from "./filter/filter";
import { FilterOption } from "./filter/option";

export class TableColumn {
    private display: string;
    private field: string;
    private searchable: boolean;

    private filter_options?: [FilterOption[], string];

    private filter?: Filter;

    public constructor(display: string, field: string, searchable = true, filter_options?: [FilterOption[], string]) {
        this.display = display;
        this.field = field;
        this.searchable = searchable;
        this.filter_options = filter_options;
    }

    public create_filter(index: number, body: TableBody, target: HTMLTableCellElement): Filter | undefined {
        if (this.filter_options) {
            this.filter = new Filter(this.filter_options[0], this.filter_options[1], index, body, target);
            return this.filter;
        }

        return undefined;
    }

    public get_display(): string {
        return this.display;
    }

    public get_field(): string {
        return this.field;
    }

    public get_filter(): Filter | undefined {
        return this.filter;
    }

    public is_searchable(): boolean {
        return this.searchable;
    }
}
