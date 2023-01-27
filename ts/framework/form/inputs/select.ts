import { FormInput } from "../input";
import { InputContainer } from "./container";

export interface SelectOption {
    get_select_text(): string;
    get_select_value(): number;
}

export class SelectInput<T extends SelectOption> implements FormInput {
    private container: InputContainer;
    private select: HTMLSelectElement;
    private label: string;

    public constructor(label: string, options: T[]) {
        console.debug(`Creating SelectInput "${label}"`);
        this.label = label;

        if (options.length == 0)
            throw "There must be at least one option for a select";

        this.select = document.createElement("select");

        this.container = new InputContainer(label, this.select);

        for (let option of options) {
            let option_element = document.createElement("option");
            option_element.innerText = option.get_select_text();
            option_element.value = String(option.get_select_value());

            this.select.appendChild(option_element);
        }
    }

    public get_element(): HTMLElement {
        return this.container.get_element();
    }

    public get_name(): string {
        return this.label;
    }

    public validate_and_get(): number {
        let value = Number(this.select.value);
        console.debug(`SelectInput "${this.label}" submitted with value "${value}"`);
        return value;
    }
}