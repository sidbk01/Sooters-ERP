import { TableBuilder } from "./builder";
import { Table } from "./table";
import { TableValue } from "./value";

export class Search<T extends TableValue, B extends TableBuilder<T>> {
    private element: HTMLInputElement;
    private table: Table<T, B>;

    public constructor(table: Table<T, B>) {
        // Set the target
        this.table = table;

        // Create the search element
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
        this.table.search(this.element.value);
    }
}