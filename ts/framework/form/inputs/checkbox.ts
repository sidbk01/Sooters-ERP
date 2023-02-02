import { FormInput } from "../input";
import { InputContainer } from "./container";

export class CheckboxInput implements FormInput {
    private container: InputContainer;
    private input: HTMLInputElement;
    private label: string;

    public constructor(label: string) {
        console.debug(`Creating CheckboxInput "${label}"`);
        this.label = label;

        this.input = document.createElement("input");
        this.input.type = "checkbox";

        this.container = new InputContainer(label, this.input);
    }

    public get_element(): HTMLElement {
        return this.container.get_element();
    }

    public get_name(): string {
        return this.label;
    }

    public validate_and_get(): boolean {
        return this.input.checked;
    }
}