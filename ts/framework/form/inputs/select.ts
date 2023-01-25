import { Error } from "../../error";
import { FormInput } from "../input";

export interface SelectOption {
    get_select_text(): string;
    get_select_value(): number;
}

export class SelectInput<T extends SelectOption> implements FormInput {
    private container: HTMLDivElement;
    private select: HTMLSelectElement;
    private error: Error;

    public constructor(placeholder: string, placeholder_error_message: string, options: T[]) {
        this.container = document.createElement("div");

        this.error = new Error(placeholder_error_message);
        this.error.set_visible(false);
        this.container.appendChild(this.error.get_element());

        this.select = document.createElement("select");

        let placeholder_option = document.createElement("option");
        placeholder_option.innerText = placeholder;
        placeholder_option.selected = true;
        placeholder_option.value = "";
        this.select.appendChild(placeholder_option);

        for (let option of options) {
            let option_element = document.createElement("option");
            option_element.innerText = option.get_select_text();
            option_element.value = String(option.get_select_value());
            this.select.appendChild(option_element);
        }

        this.container.appendChild(this.select);
    }

    public get_element(): HTMLElement {
        return this.container;
    }

    public validate_and_get(): number {
        let value = this.select.value;

        if (value == "") {
            this.error.set_visible(true);
            this.select.onchange = () => { this.clear_error(); };
            throw this.error.get_message();
        }

        return Number(value);
    }

    private clear_error() {
        this.error.set_visible(false);
        this.select.onchange = () => { };
    }
}