import { DisplayFieldInput } from "../input";

export class CheckboxDisplayField implements DisplayFieldInput {
    private container: HTMLDivElement;
    private input: HTMLInputElement;
    private value_element: HTMLDivElement;

    private value: boolean;

    private value_true: string;
    private value_false: string;

    public constructor(initial_value: boolean, value_true = "Yes", value_false = "No") {
        console.debug(`Creating CheckboxDisplayField`);

        this.value = initial_value;
        this.value_true = value_true;
        this.value_false = value_false;

        this.container = document.createElement("div");

        this.input = document.createElement("input");
        this.input.type = "checkbox";
        this.input.style.display = "none";
        this.container.appendChild(this.input);

        this.value_element = document.createElement("div");
        this.value_element.innerText = this.value ? value_true : value_false;
        this.container.appendChild(this.value_element);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public begin_edit() {
        this.value_element.style.display = "none";
        this.input.style.display = "";
        this.input.checked = this.value;
    }

    public get_value_and_validate(): boolean {
        return this.input.checked;
    }

    public confirm_edit() {
        this.value = this.input.checked;
        this.value_element.innerText = this.value ? this.value_true : this.value_false;
    }

    public cancel_edit() {
        this.value_element.style.display = "";
        this.input.style.display = "none";
    }
}