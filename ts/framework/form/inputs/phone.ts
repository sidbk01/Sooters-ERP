import { FormInput } from "../input";
import { InputContainer } from "./container";

export class PhoneInput implements FormInput {
    private container: InputContainer;
    private input: HTMLInputElement;
    private label: string;
    private required: boolean;

    public constructor(label: string, required = false) {
        console.debug(`Creating PhoneInput "${label}"`);
        this.label = label;

        this.required = required;

        this.input = document.createElement("input");
        this.input.type = "tel";
        this.input.maxLength = 14;
        this.input.onkeyup = () => { this.on_key_up(); };

        this.container = new InputContainer(label, this.input);
    }

    public get_element(): HTMLElement {
        return this.container.get_element();
    }

    public get_name(): string {
        return this.label;
    }

    public validate_and_get(): string {
        let value = this.input.value.trim();

        console.debug(`PhoneInput "${this.label}" submitted with value "${value}"`);

        validation: try {
            if (value.length == 0) {
                if (this.required)
                    throw "A phone number is required";

                break validation;
            }

            if (value.length != 14 || !value.match(/\([0-9]{3}\) [0-9]{3}\-[0-9]{4}/))
                throw "Invalid phone-number, must be \"(XXX) XXX-XXXX\"";
        } catch (e) {
            this.container.get_error().set_message(e);
            this.input.onkeydown = () => {
                this.clear_error();
            };
            throw e;
        }

        return value;
    }

    private clear_error() {
        this.container.get_error().set_message("");
        this.input.onkeydown = () => { };
    }

    private format(value: string): string {
        if (value.length == 0)
            return value;

        let phone_number = value.replace(/[^\d]/g, '');
        if (phone_number.length <= 3)
            return phone_number;

        if (phone_number.length < 7)
            return `(${phone_number.slice(0, 3)}) ${phone_number.slice(3)}`;

        return `(${phone_number.slice(0, 3)}) ${phone_number.slice(3, 6)}-${phone_number.slice(6, 10)}`;
    }

    private on_key_up() {
        this.input.value = this.format(this.input.value);
    }
}