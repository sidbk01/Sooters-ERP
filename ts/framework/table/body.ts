import { TableColumn } from "./column";
import { TableRow } from "./row";
import { TableValue } from "./value";

export class TableBody {
    private element: HTMLTableSectionElement;
    private rows: TableRow[];

    private constructor() { }

    public static async create(values: TableValue[], columns: TableColumn[]): Promise<TableBody> {
        let body = new TableBody();

        // Create the body element
        body.element = document.createElement("tbody");

        // Fill in the rows
        body.rows = [];
        for (let value of values) {
            let row = await TableRow.create(value, columns);
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
        for (let row of this.rows)
            row.update_filter(index);
    }
}