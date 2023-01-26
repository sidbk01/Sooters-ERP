import { TableBody } from "./body";
import { TableBuilder } from "./builder";
import { TableColumn } from "./column";
import { TableHeader } from "./header";
import { Search } from "./search";
import { TableValue } from "./value";

export class Table<T extends TableValue, B extends TableBuilder<T>> {
    private element: HTMLTableElement;

    private body: TableBody;

    public static async create<T extends TableValue, B extends TableBuilder<T>>(id: string, builder: B): Promise<Table<T, B>> {
        let table = new Table();

        // Get the columns
        let columns = await builder.get_columns();

        // Create the table element
        table.element = document.createElement("table");

        // Create the body
        table.body = await TableBody.create(builder.get_values(), columns);

        // Create the header
        let header = new TableHeader(columns, table.body);

        // Append the elements
        table.element.appendChild(header.get_element());
        table.element.appendChild(table.body.get_element());

        // Create the search element
        let search = new Search(table);

        // Attach to the DOM
        let target = document.getElementById(id);
        target.appendChild(search.get_element());
        target.appendChild(table.element);

        return table;
    }

    public search(term: string) {
        this.body.search(term.toUpperCase());
    }
}