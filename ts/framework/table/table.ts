import { TableBody } from "./body";
import { TableBuilder } from "./builder";
import { ExtraFilter } from "./filter/extra";
import { TableHeader } from "./header";
import { Search } from "./search";
import { TableValue } from "./value";

export class Table {
    private element: HTMLTableElement;

    private body: TableBody;

    private constructor(id: string) {
        console.debug(`Creating Table "${id}"`);
    }

    public static async create<T extends TableValue, B extends TableBuilder<T>>(id: string, builder: B): Promise<Table> {
        let table = new Table(id);

        // Get the columns
        console.debug(`Getting columns from builder for Table "${id}"`);
        let columns = await builder.get_columns();

        // Create the table element
        table.element = document.createElement("table");

        // Create the body
        table.body = await TableBody.create(id, builder.get_values(), columns);

        // Create the header
        let header = new TableHeader(columns, table.body);

        // Append the elements
        table.element.appendChild(header.get_element());
        table.element.appendChild(table.body.get_element());

        // Create the search element
        let search = new Search(table);

        // Create the extra filter, if needed
        let extra_filter_input = await builder.get_extra_filter_input();
        let extra_filter;
        if (extra_filter_input)
            extra_filter = new ExtraFilter(extra_filter_input, table.body);

        // Attach to the DOM
        console.debug(`Attaching Table "${id}" to DOM`);
        let target = document.getElementById(id);
        if (extra_filter)
            target.appendChild(extra_filter.get_element());
        target.appendChild(search.get_element());
        target.appendChild(table.element);

        return table;
    }

    public search(term: string) {
        console.debug(`Searching "${term}"`);
        this.body.search(term.toUpperCase());
    }
}