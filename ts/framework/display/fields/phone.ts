import { Error } from "../../error";
import { DisplayFieldInput } from "../input";

export class PhoneDisplayField implements DisplayFieldInput {
    private container: HTMLDivElement;
    private input_container: HTMLDivElement;
    private input: HTMLInputElement;
    private error: Error;
    private value_element: HTMLDivElement;

    private value: string;
    private required: boolean;

    public constructor(initial_value: string, required = false) {
        console.debug(`Creating PhoneDisplayField`);

        this.value = initial_value;
        this.required = required;

        this.container = document.createElement("div");

        this.input_container = document.createElement("div");
        this.input_container.style.display = "none";

        this.input = document.createElement("input");
        this.input.type = "tel";
        this.input.maxLength = 14;
        this.input.onkeyup = () => { this.on_key_up(); };
        this.input_container.appendChild(this.input);

        this.error = new Error();
        this.input_container.appendChild(this.error.get_element());

        this.container.appendChild(this.input_container);

        this.value_element = document.createElement("div");
        this.value_element.innerText = initial_value;
        this.container.appendChild(this.value_element);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public begin_edit() {
        this.value_element.style.display = "none";
        this.input_container.style.display = "";
        this.input.value = this.value;
        this.error.set_message("");
    }

    public get_value_and_validate(): any {
        let value = this.input.value.trim();

        validation: try {
            if (value.length == 0) {
                if (this.required)
                    throw "A phone number is required";

                break validation;
            }

            if (value.length != 14 || !value.match(/\([0-9]{3}\) [0-9]{3}\-[0-9]{4}/))
                throw "Invalid phone-number, must be \"(XXX) XXX-XXXX\"";
        } catch (e) {
            this.error.set_message(e);
            this.input.onkeydown = () => {
                this.error.set_message("");
                this.input.onkeydown = () => { };
            };
            throw e;
        }

        return this.input.value;
    }

    public confirm_edit() {
        this.value = this.input.value;
        this.value_element.innerText = this.value;
    }

    public cancel_edit() {
        this.value_element.style.display = "";
        this.input_container.style.display = "none";
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