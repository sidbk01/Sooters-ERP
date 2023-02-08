import { FormInput } from "../input";
import { InputContainer } from "./container";

export class TextInput implements FormInput {
    private container: InputContainer;
    private input: HTMLInputElement;
    private label: string;

    private validate?: (text: string) => void;

    public constructor(label: string, max_length: number, validate?: (text: string) => void, type = "text") {
        console.debug(`Creating TextInput "${label}"`);
        this.label = label;

        this.input = document.createElement("input");
        this.input.type = type;
        this.input.maxLength = max_length;

        this.container = new InputContainer(label, this.input);

        this.validate = validate;
    }

    public get_element(): HTMLElement {
        return this.container.get_element();
    }

    public get_name(): string {
        return this.label;
    }

    public validate_and_get(): string | number {
        let value = this.input.value.trim();

        console.debug(`TextInput "${this.label}" submitted with value "${value}"`);

        if (this.validate) {
            try {
                this.validate(value);
            } catch (e) {
                if (typeof e === "string") {
                    this.container.get_error().set_message(e);
                    this.input.onkeydown = () => { this.clear_error(); };
                }

                throw e;
            }
        }

        if (this.input.type == "number") {
            if (value)
                return Number(value);

            return undefined;
        }

        return value;
    }

    private clear_error() {
        this.container.get_error().set_message("");
        this.input.onkeydown = () => { };
    }
}