import { Table } from "./table";

export class Search {
    private element: HTMLInputElement;
    private table: Table;

    public constructor(table: Table) {
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