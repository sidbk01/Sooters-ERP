import { TableBuilder, TableValue } from "./builder";
import { Search } from "./search";

export class TableColumn {
    private display: string;
    private field: string;
    private searchable: boolean;

    public constructor(display: string, field: string, searchable = true) {
        this.display = display;
        this.field = field;
        this.searchable = searchable;
    }

    public get_display(): string {
        return this.display;
    }

    public get_field(): string {
        return this.field;
    }

    public is_searchable(): boolean {
        return this.searchable;
    }
}

export class Table<T extends TableValue, B extends TableBuilder<T>> {
    private element: HTMLTableElement;
    private body: HTMLTableSectionElement;

    private columns: TableColumn[];
    private text_filter: string;

    private constructor() {
        this.text_filter = "";
    }

    public static async create<T extends TableValue, B extends TableBuilder<T>>(id: string, builder: B): Promise<Table<T, B>> {
        let table = new Table();

        table.columns = builder.get_columns();

        // Create the table element
        table.element = document.createElement("table");

        // Fill in the table header
        let table_header = document.createElement("thead");
        let table_header_row = document.createElement("tr");
        for (let column of table.columns) {
            let column_header = document.createElement("th");
            column_header.innerText = column.get_display();
            table_header_row.appendChild(column_header);
        }
        table_header.appendChild(table_header_row);
        table.element.appendChild(table_header);

        // Fill in the table body
        table.body = document.createElement("tbody");
        for (let value of builder.get_values()) {
            let row = document.createElement("tr");

            let onclick_target = value.generate_on_click();
            if (onclick_target != "") {
                row.classList.add("clickable");
                row.onclick = () => { window.location.href = onclick_target };
            }

            for (let column of table.columns) {
                let cell = document.createElement("td");
                let inner = await value.render_field(column.get_field());

                if (typeof inner == "string")
                    cell.innerText = inner;
                else
                    cell.appendChild(inner);

                row.appendChild(cell);
            }

            table.body.appendChild(row);
        }
        table.element.appendChild(table.body);

        // Create the search element
        let search = new Search(table);

        // Attach to the DOM
        let target = document.getElementById(id);
        target.appendChild(search.get_element());
        target.appendChild(table.element);

        return table;
    }

    public set_text_filter(new_filter: string) {
        this.text_filter = new_filter;
        this.filter_rows();
    }

    private filter_rows() {
        for (let row of this.body.children) {
            let include = false;

            if (this.text_filter == "")
                include = true;
            else {
                for (let i = 0; i < this.columns.length; i++) {
                    let column = this.columns[i];

                    if (!column.is_searchable())
                        continue;

                    include ||= (row.children[i] as HTMLElement).innerText.toUpperCase().indexOf(this.text_filter) > -1;
                }
            }

            if (include)
                (row as HTMLElement).style.display = "";
            else
                (row as HTMLElement).style.display = "none";
        }
    }
}