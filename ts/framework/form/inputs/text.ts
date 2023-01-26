import { FormInput } from "../input";
import { Error } from "../../error";
import { InputContainer } from "./container";

export class TextInput implements FormInput {
    private container: InputContainer;
    private input: HTMLInputElement;

    private validate?: (text: string) => void;

    public constructor(label: string, max_length: number, validate?: (text: string) => void) {
        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.maxLength = max_length;

        this.container = new InputContainer(label, this.input);

        this.validate = validate;
    }

    public get_element(): HTMLElement {
        return this.container.get_element();
    }

    public validate_and_get(): string {
        let value = this.input.value.trim();

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

        return value;
    }

    private clear_error() {
        this.container.get_error().set_message("");
        this.input.onkeydown = () => { };
    }
}