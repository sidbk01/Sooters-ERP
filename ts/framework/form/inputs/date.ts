import { FormInput } from "../input";
import { InputContainer } from "./container";

export class DateInput implements FormInput {
    private container: InputContainer;
    private input: HTMLInputElement;
    private label: string;
    private required_message?: string;

    public constructor(label: string, required_message?: string, time = false) {
        console.debug(`Creating DateInput "${label}"`);
        this.label = label;
        this.required_message = required_message;

        this.input = document.createElement("input");
        this.input.type = time ? "datetime-local" : "date";

        this.container = new InputContainer(label, this.input);
    }

    public get_element(): HTMLElement {
        return this.container.get_element();
    }

    public get_name(): string {
        return this.label;
    }

    public validate_and_get(): string {
        try {
            if (this.required_message && this.input.value == '')
                throw this.required_message;
        } catch (e) {
            this.container.get_error().set_message(e);
            this.input.onchange = () => {
                this.container.get_error().set_message("");
                this.input.onchange = () => { };
            };
            throw e;
        }

        return this.input.value;
    }
}