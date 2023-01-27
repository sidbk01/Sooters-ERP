import { NumberParser, ajax } from "../ajax";
import { FormBuilder } from "./builder";
import { FormSubmit } from "./submit";

export class Form<T extends FormBuilder> {
    private element: HTMLFormElement;
    private builder: T;

    public constructor(id: string, builder: T) {
        console.debug(`Creating Form "${id}"`);

        this.builder = builder;

        // Create the form element
        this.element = document.createElement("form");

        // Set the submit to not refresh the page
        this.element.onsubmit = () => {
            this.on_submit();
            return false;
        };

        // Build the form elements
        for (let input of builder.get_inputs()) {
            console.debug(`Appending Input "${input.get_name()}" to Form "${id}"`)
            this.element.appendChild(input.get_element());
        }

        // Create the submit button
        let submit_button = new FormSubmit(id, builder.get_submit_text());
        this.element.appendChild(submit_button.get_element());

        // Attach the form to the DOM
        let target = document.getElementById(id);
        target.parentNode.replaceChild(this.element, target);
    }

    private async on_submit() {
        let value;
        try {
            value = this.builder.collect_and_validate();
        } catch (e) {
            console.error(`An error occurred while validating the form`);
            console.error(e);
            return;
        }

        try {
            let result = await ajax<number, NumberParser>("POST", this.builder.get_post_url(), new NumberParser(), value);
            window.location.href = this.builder.get_redirect_url(result);
        } catch (e) {
            console.error(`A networking error has occurred`);
            console.error(e);
            alert("An error has occurred, please report this to Lance Hart");
        }
    }
}