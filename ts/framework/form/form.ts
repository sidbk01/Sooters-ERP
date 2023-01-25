import { NumberParser, ajax } from "../ajax";
import { FormBuilder } from "./builder";

export class Form<T extends FormBuilder> {
    private element: HTMLFormElement;
    private builder: T;

    public constructor(id: string, builder: T) {
        this.builder = builder;

        // Create the form element
        this.element = document.createElement("form");

        // Set the submit to not refresh the page
        this.element.onsubmit = () => { return false; };

        for (let input of builder.get_inputs())
            this.element.appendChild(input.get_element());

        // Create the submit button
        let submit_button = document.createElement("input");
        submit_button.type = "submit";
        submit_button.onclick = () => { this.on_submit(); };
        submit_button.value = builder.get_submit_text();
        this.element.appendChild(submit_button);

        // Attach the form to the DOM
        let target = document.getElementById(id);
        target.parentNode.replaceChild(this.element, target);
    }

    private async on_submit() {
        let value;
        try {
            value = this.builder.collect_and_validate();
        } catch (e) {
            console.log(`An error occurred while validating the form`);
            console.log(e);
            return;
        }

        try {
            let result = await ajax<number, NumberParser>("POST", this.builder.get_post_url(), new NumberParser(), value);
            window.location.href = this.builder.get_redirect_url(result);
        } catch (e) {
            console.log(`A networking error has occurred`);
            console.log(e);
            alert("An error has occurred, please report this to Lance Hart");
        }
    }
}