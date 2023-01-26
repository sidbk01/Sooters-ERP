import { TableBody } from "./body";
import { TableColumn } from "./column";

export class TableHeader {
    private element: HTMLTableSectionElement;

    public constructor(columns: TableColumn[], body: TableBody) {
        // Calculate the column width
        let column_width = 100 / columns.length;

        // Create the element
        this.element = document.createElement("thead");

        // Create the row
        let table_header_row = document.createElement("tr");

        // Fill in the column headers
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i];

            // Create and style the column
            let column_header = document.createElement("th");
            column_header.style.width = `${column_width}%`;

            // Add the display name
            column_header.appendChild(document.createTextNode(column.get_display()));

            // Add the filter if needed
            let filter = column.create_filter(i, body, column_header);
            if (filter) {
                column_header.appendChild(filter.get_image_element());
                column_header.appendChild(filter.get_dropdown_element());
            }

            // Add the column to the row
            table_header_row.appendChild(column_header);
        }

        // Add the row to the header
        this.element.appendChild(table_header_row);
    }

    public get_element(): HTMLTableSectionElement {
        return this.element;
    }
}