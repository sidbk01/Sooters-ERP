import { Error } from "../../error";
import { DisplayFieldInput } from "../input";

export class DateDisplayField implements DisplayFieldInput {
    private container: HTMLDivElement;
    private input_container: HTMLDivElement;
    private input: HTMLInputElement;
    private error: Error;
    private value_element: HTMLDivElement;

    private value: string;
    private required_message: string;

    public constructor(initial_value: string, required_message?: string) {
        console.debug(`Creating DateDisplayField`);

        this.value = initial_value;
        this.required_message = required_message;

        this.container = document.createElement("div");

        this.input_container = document.createElement("div");
        this.input_container.style.display = "none";

        this.input = document.createElement("input");
        this.input.type = "date";
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

        // TODO: Add parsing of date value
        this.input.value = this.value;
        this.error.set_message("");
    }

    public get_value_and_validate(): string {
        let value = this.input.value;

        try {
            if (this.required_message && value == "")
                throw this.required_message;
        } catch (e) {
            this.error.set_message(e);
            this.input.onkeydown = () => {
                this.error.set_message("");
                this.input.onkeydown = () => { }
            };

            throw e;
        }

        return value == "" ? undefined : value;
    }

    public confirm_edit() {
        // TODO: Add formatting of date
        this.value = this.input.value;
        this.value_element.innerText = this.value;
    }

    public cancel_edit() {
        this.value_element.style.display = "";
        this.input_container.style.display = "none";
    }
}