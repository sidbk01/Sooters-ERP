import { DisplayBuilder } from "./builder";
import { Error } from "../error";

export class DisplayTitle {
    private container: HTMLDivElement;
    private text: HTMLDivElement;
    private input?: HTMLInputElement;
    private error?: Error;

    private field_name?: string;

    private builder: DisplayBuilder;

    public constructor(builder: DisplayBuilder) {
        this.builder = builder;
        this.field_name = builder.get_title_field_name();

        // Create the container
        this.container = document.createElement("h2");

        // Create the text
        this.text = document.createElement("div");
        this.text.innerHTML = builder.get_title();
        this.container.appendChild(this.text);

        // If needed, create the input
        if (!this.field_name)
            return;

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.maxLength = builder.get_title_max_length();
        this.input.style.display = "none";
        this.container.appendChild(this.input);

        this.error = new Error();
        this.error.get_element().style.display = "none";
        this.container.appendChild(this.error.get_element());
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public begin_edit() {
        // Only begin editing if needed
        if (!this.input)
            return;

        // Hide the text and display the input
        this.text.style.display = "none";
        this.input.style.display = "";
        this.error.get_element().style.display = "";

        // Set the input's value to the text
        this.input.value = this.text.innerText;
    }

    public get_value_and_validate(): [string | undefined, string] {
        if (!this.input)
            return [undefined, ""];

        try {
            this.builder.validate_title(this.input.value);
        } catch (e) {
            this.error.set_message(e);
            this.input.onkeydown = () => { this.clear_error(); };
            throw e;
        }

        return [this.field_name, this.input.value];
    }

    public confirm_edit() {
        this.text.innerText = this.input.value;
    }

    public cancel_edit() {
        if (!this.input)
            return;

        this.text.style.display = "";
        this.input.style.display = "none";
        this.error.get_element().style.display = "none";
    }

    private clear_error() {
        this.error.set_message("");
        this.input.onkeydown = () => { };
    }
}