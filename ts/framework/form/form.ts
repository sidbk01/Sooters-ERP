import { ajax } from "../ajax";
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
            console.log(`Validation Error: ${e}`);
            return;
        }

        try {
            let result = await ajax<number>("POST", this.builder.get_post_url(), value);
            console.log(result);
        } catch (e) {
            console.log(`Network Error: ${e}`);
            alert("An error has occurred, please report this to Lance Hart");
        }
    }
}