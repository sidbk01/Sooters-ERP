import { Filter } from "./filter";
import { FilterOption } from "./filter_option";

export class TableColumn {
    private display: string;
    private field: string;
    private searchable: boolean;
    private filter?: Filter;

    public constructor(display: string, field: string, searchable = true, filter_options?: [FilterOption[], string]) {
        this.display = display;
        this.field = field;
        this.searchable = searchable;

        if (filter_options)
            this.filter = new Filter(filter_options[0], filter_options[1]);
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
