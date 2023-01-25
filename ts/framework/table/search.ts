import { TableBuilder, TableValue } from "./builder";
import { Table } from "./table";

export class Search<T extends TableValue, B extends TableBuilder<T>> {
    private element: HTMLInputElement;
    private table: Table<T, B>;

    public constructor(table: Table<T, B>) {
        this.table = table;

        this.element = document.createElement("input");
        this.element.type = "text";
        this.element.placeholder = "Search";
        this.element.classList.add("search");
        this.element.onkeyup = () => { this.perform_search(); }
    }

    public get_element(): HTMLInputElement {
        return this.element;
    }

    private perform_search() {
        this.table.set_text_filter(this.element.value.toUpperCase());
    }
}