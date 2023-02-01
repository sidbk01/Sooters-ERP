import { TableBody } from "../body";
import { FilterOption } from "./option";

export class ExtraFilterInput {
    private label: string;
    private field: string;
    private options: FilterOption[];

    public constructor(label: string, field: string, options: FilterOption[]) {
        this.label = label;
        this.field = field;
        this.options = options;
    }

    public get_label(): string {
        return this.label;
    }

    public get_options(): FilterOption[] {
        return this.options;
    }

    public get_field(): string {
        return this.field;
    }
}

export class ExtraFilter {
    private container: HTMLDivElement;
    private select: HTMLSelectElement;
    private options: FilterOption[];

    public constructor(input: ExtraFilterInput, body: TableBody) {
        this.options = input.get_options();

        this.container = document.createElement("div");
        this.container.classList.add("location-filter");

        this.container.appendChild(document.createTextNode(`${input.get_label()}: `));

        this.select = document.createElement("select");
        this.select.onchange = () => { body.extra_filter(input.get_field(), this.select.value) };

        let any_option = document.createElement("option");
        any_option.value = undefined;
        any_option.innerText = "Any";
        any_option.selected = true;
        this.select.appendChild(any_option);

        for (let option of this.options) {
            let element = document.createElement("option");
            element.innerText = option.get_display();
            element.value = option.get_value();
            this.select.appendChild(element);
        }

        this.container.appendChild(this.select);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }
}