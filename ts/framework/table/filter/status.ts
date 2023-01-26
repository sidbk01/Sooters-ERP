import { TableBody } from "../body";
import { TableValue } from "../value";
import { FilterOption } from "./option";

export class FilterStatus {
    container: HTMLDivElement;
    input: HTMLInputElement;

    option: FilterOption;
    index: number;

    public constructor(option: FilterOption, index: number, body: TableBody) {
        this.option = option;

        // Create the container
        this.container = document.createElement("div");

        // Create the label
        let label = document.createElement("label");
        label.innerText = option.get_display();
        this.container.appendChild(label);

        // Create the input
        this.input = document.createElement("input");
        this.input.type = "checkbox";
        this.input.style.marginLeft = "0.25rem";
        this.input.checked = true;
        this.input.onchange = () => { body.update_filter(index); };
        this.container.appendChild(this.input);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public filter_value(value: TableValue, field: string): boolean {
        if (!this.input.checked)
            return false;

        return this.option.filter_value(value, field);
    }
}