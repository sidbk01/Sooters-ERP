import { FormInput } from "../input";
import { Error } from "../../error";

export class TextInput implements FormInput {
    private container: HTMLDivElement;
    private input: HTMLInputElement;
    private error?: Error;

    validation_function: (text: string) => boolean;

    public constructor(placeholder: string, max_length: number, required_error_message?: string, validation_function = (_: string) => { return true; }) {
        this.validation_function = validation_function;

        this.container = document.createElement("div");

        if (required_error_message) {
            this.error = new Error(required_error_message);
            this.error.set_visible(false);
            this.container.appendChild(this.error.get_element());
        }

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.maxLength = max_length;
        this.input.placeholder = placeholder;
        this.container.appendChild(this.input);
    }

    public get_element(): HTMLElement {
        return this.container;
    }

    public validate_and_get(): string {
        let value = this.input.value.trim();

        if (this.error && value.length == 0) {
            this.error.set_visible(true);
            this.input.onkeydown = () => { this.clear_error(); };
            throw this.error.get_message();
        }

        console.log(`Text value: ${value}`);

        return value;
    }

    private clear_error() {
        this.error.set_visible(false);
        this.input.onkeydown = () => { };
    }
}