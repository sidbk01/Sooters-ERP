import { SelectOption } from "../../index";
import { DisplayFieldInput } from "../input";

export class SelectDisplayField implements DisplayFieldInput {
    private container: HTMLDivElement;
    private input: HTMLSelectElement;
    private value_element: HTMLDivElement;

    private value: number;
    private options: SelectOption[];

    public constructor(options: SelectOption[], initial_value: number) {
        console.debug(`Creating SelectDisplayField`);

        this.value = initial_value;
        this.options = options;

        this.container = document.createElement("div");

        this.input = document.createElement("select");
        this.input.style.display = "none";
        for (let option of options) {
            let option_element = document.createElement("option");
            option_element.innerText = option.get_select_text();
            option_element.value = String(option.get_select_value());

            this.input.appendChild(option_element);
        }
        this.container.appendChild(this.input);

        this.value_element = document.createElement("div");
        this.value_element.innerText = this.value_to_string(this.value);
        this.container.appendChild(this.value_element);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public begin_edit() {
        this.value_element.style.display = "none";
        this.input.style.display = "";

        for (let i = 0; i < this.options.length; i++) {
            if (this.options[i].get_select_value() == this.value) {
                this.input.selectedIndex = i;
                break;
            }
        }
    }

    public get_value_and_validate(): any {
        return Number(this.input.value);
    }

    public confirm_edit() {
        this.value = Number(this.input.value);
        this.value_element.innerText = this.value_to_string(this.value);
    }

    public cancel_edit() {
        this.value_element.style.display = "";
        this.input.style.display = "none";
    }

    private value_to_string(value: number): string {
        for (let option of this.options)
            if (option.get_select_value() == value)
                return option.get_select_text();

        throw `${value} is not a valid option`;
    }
}