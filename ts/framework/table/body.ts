import { TableColumn } from "./column";
import { TableRow } from "./row";
import { TableValue } from "./value";

export class TableBody {
    private element: HTMLTableSectionElement;
    private rows: TableRow[];
    private id: string;

    private constructor(id: string) {
        console.debug(`Creating TableBody for Table "${id}"`);
        this.id = id;
    }

    public static async create(id: string, values: TableValue[], columns: TableColumn[]): Promise<TableBody> {
        let body = new TableBody(id);

        // Create the body element
        body.element = document.createElement("tbody");

        // Fill in the rows
        body.rows = [];
        for (let value of values) {
            let row = await TableRow.create(id, value, columns);
            body.element.appendChild(row.get_element());
            body.rows.push(row);
        }

        return body;
    }

    public get_element(): HTMLTableSectionElement {
        return this.element;
    }

    public search(term: string) {
        for (let row of this.rows)
            row.search(term);
    }

    public update_filter(index: number) {
        console.debug(`Updating filter ${index} on Table "${this.id}"`);
        for (let row of this.rows)
            row.update_filter(index);
    }

    public extra_filter(field: string, value: any) {
        for (let row of this.rows)
            row.extra_filter(field, value);
    }

    public sort(index: number, ascending: boolean) {
        console.debug(`Sorting column ${index} on Table "${this.id}" ${ascending ? "ascending" : "descending"}`);

        // Remove all rows from the body
        this.element.innerHTML = "";

        // Sort the rows
        this.rows.sort((a, b) => {
            let result = a.compare(b, index);
            if (!ascending)
                result = -result;

            return result;
        });

        // Reinsert the rows in sorted order
        for (let row of this.rows)
            this.element.appendChild(row.get_element());
    }
}