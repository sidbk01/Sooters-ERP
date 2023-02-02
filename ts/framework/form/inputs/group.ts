import { FormInput } from "../input";
import { InputContainer } from "./container";
import { SelectOption } from "./select";

export interface GroupOption extends SelectOption {
    get_inputs(): [string, FormInput][];
}

export class GroupInput<T extends GroupOption> implements FormInput {
    private container: HTMLDivElement;

    private group: HTMLDivElement;
    private options: GroupOption[];
    private inputs: [string, FormInput][];

    private select_container: InputContainer;
    private select: HTMLSelectElement;
    private label: string;
    private placeholder: HTMLOptionElement;

    private placeholder_error: string;

    public constructor(label: string, placeholder: string, placeholder_error: string, options: GroupOption[]) {
        this.label = label;
        this.placeholder_error = placeholder_error;
        this.options = options;
        this.inputs = [];

        if (options.length == 0)
            throw "There must be at least one option for a select";

        this.container = document.createElement("div");

        this.select = document.createElement("select");
        this.select.onchange = () => { this.remove_placeholder(); };

        this.placeholder = document.createElement("option");
        this.placeholder.innerText = placeholder;
        this.placeholder.value = undefined;
        this.select.appendChild(this.placeholder);

        for (let option of options) {
            let option_element = document.createElement("option");
            option_element.innerText = option.get_select_text();
            option_element.value = option.get_select_value().toString();
            this.select.appendChild(option_element);
        }

        this.select_container = new InputContainer(label, this.select);
        this.container.appendChild(this.select_container.get_element());

        this.group = document.createElement("div");
        this.container.appendChild(this.group);
    }

    public get_element(): HTMLElement {
        return this.container;
    }

    public get_name(): string {
        return this.label;
    }

    public validate_and_get(): any {
        try {
            if (this.select.value === "undefined")
                throw this.placeholder_error;
        } catch (e) {
            this.select_container.get_error().set_message(e);
            this.select.onchange = () => {
                this.select_container.get_error().set_message("");
                this.remove_placeholder();
            };
            throw e;
        }

        let results = {};
        for (let [field, input] of this.inputs)
            results[field] = input.validate_and_get();

        return [
            Number(this.select.value),
            results,
        ];
    }

    private remove_placeholder() {
        this.placeholder.remove();
        this.select.onchange = () => { this.on_change(); };
        this.on_change();
    }

    private on_change() {
        this.group.innerHTML = "";

        let group_value = this.select.value;
        if (group_value === "undefined")
            return;

        let group;
        for (let option of this.options) {
            if (option.get_select_value() == Number(group_value)) {
                group = option;
                break;
            }
        }

        if (typeof group === "undefined")
            throw "Invalid group selected!";

        this.inputs = group.get_inputs();
        for (let [_, input] of this.inputs)
            this.group.appendChild(input.get_element());
    }
}