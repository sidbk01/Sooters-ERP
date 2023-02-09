import { TableColumn } from "./column";
import { Filter } from "./filter/filter";
import { TableValue } from "./value";

class ColumnStatus {
    column: TableColumn;
    filter_status: boolean;

    public constructor(column: TableColumn) {
        this.column = column;
        this.filter_status = true;
    }

    public is_searchable(): boolean {
        return this.column.is_searchable();
    }

    public update_filter(value: TableValue) {
        let filter = this.column.get_filter();

        if (filter)
            this.filter_status = filter.filter_value(value, this.column.get_field());
        else
            this.filter_status = true;
    }
}

export class TableRow {
    private element: HTMLTableRowElement;

    private value: TableValue;
    private search_status: boolean;
    private extra_status: boolean;
    private columns: ColumnStatus[];

    private constructor(id: string, columns: TableColumn[], value: TableValue) {
        console.debug(`Creating TableRow on Table "${id}"`);

        this.search_status = true;
        this.extra_status = true;
        this.columns = columns.map((column) => { return new ColumnStatus(column); });
        this.value = value;
    }

    public static async create(id: string, value: TableValue, columns: TableColumn[]): Promise<TableRow> {
        let row = new TableRow(id, columns, value);

        // Create the row element
        row.element = document.createElement("tr");

        // Add onclick if needed
        let onclick_target = value.on_click_url(window.location.pathname + window.location.search);
        if (onclick_target != "") {
            row.element.classList.add("clickable");
            row.element.onclick = () => { window.location.href = onclick_target };
        }

        // Add the columns
        for (let column of columns) {
            // Create the cell
            let cell = document.createElement("td");

            // Set the value
            let inner = await value.render_field(column.get_field());
            if (typeof inner == "string")
                cell.innerText = inner;
            else
                cell.appendChild(inner);

            // Add the cell to the row
            row.element.appendChild(cell);
        }

        return row;
    }

    public get_element(): HTMLTableRowElement {
        return this.element;
    }

    public search(term: string) {
        if (term == "") {
            this.search_status = true;
            return this.update_display();
        }

        this.search_status = false;

        for (let i = 0; i < this.columns.length; i++) {
            if (!this.columns[i].is_searchable())
                continue;

            this.search_status ||= (this.element.children[i] as HTMLElement).innerText.toUpperCase().indexOf(term) > -1;
        }

        this.update_display();
    }

    public update_filter(index: number) {
        this.columns[index].update_filter(this.value);
        this.update_display();
    }

    public extra_filter(field: string, value: any) {
        if (value == "undefined")
            this.extra_status = true;
        else
            this.extra_status = this.value.filter(field, value);

        this.update_display();
    }

    public compare(other: TableRow, index: number): number {
        let a = (this.element.children[index] as HTMLElement).innerText.toLowerCase();
        let b = (other.element.children[index] as HTMLElement).innerText.toLowerCase();

        if (a < b)
            return -1;

        if (a > b)
            return 1;

        return 0;
    }

    private update_display() {
        let display = this.search_status && this.extra_status;

        for (let column of this.columns)
            if (!column.filter_status)
                display = false;

        if (display)
            this.element.style.display = "";
        else
            this.element.style.display = "none";
    }
}

