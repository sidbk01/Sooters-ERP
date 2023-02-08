import { Error } from "../../error";
import { DisplayFieldInput } from "../input";

export class TextDisplayField implements DisplayFieldInput {
    private container: HTMLDivElement;
    private input_container?: HTMLDivElement;
    private input?: HTMLInputElement;
    private error?: Error;
    private value_element: HTMLDivElement;

    private value: string;
    private validate?: (text: string) => void;

    public constructor(initial_value: string, max_length: number, validate?: (text: string) => void, type = "text") {
        console.debug(`Creating TextDisplayField`);

        this.value = initial_value;
        this.validate = validate;

        this.container = document.createElement("div");

        if (max_length > 0) {
            this.input_container = document.createElement("div");
            this.input_container.style.display = "none";

            this.input = document.createElement("input");
            this.input.type = type;
            this.input.maxLength = max_length;
            this.input_container.appendChild(this.input);

            this.error = new Error();
            this.input_container.appendChild(this.error.get_element());

            this.container.appendChild(this.input_container);
        }

        this.value_element = document.createElement("div");
        this.value_element.innerText = initial_value;
        this.container.appendChild(this.value_element);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public begin_edit() {
        if (!this.input_container)
            return;

        this.value_element.style.display = "none";
        this.input_container.style.display = "";
        this.input.value = this.value;
        this.error.set_message("");
    }

    public get_value_and_validate(): any {
        if (!this.input_container)
            return undefined;

        if (this.validate) {
            try {
                this.validate(this.input.value);
            } catch (e) {
                this.error.set_message(e);
                this.input.onkeydown = () => {
                    this.error.set_message("");
                    this.input.onkeydown = () => { }
                };

                throw e;
            }
        }

        if (this.input.type == "number") {
            if (this.input.value)
                return Number(this.input.value);
        
            return undefined;
        }
            
        return this.input.value;
    }

    public confirm_edit() {
        if (!this.input_container)
            return;

        this.value = this.input.value;
        this.value_element.innerText = this.value;
    }

    public cancel_edit() {
        if (!this.input_container)
            return;

        this.value_element.style.display = "";
        this.input_container.style.display = "none";
    }
}