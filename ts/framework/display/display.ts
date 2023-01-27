import { DisplayBuilder } from "./builder";
import { DisplayField } from "./field";

export class Display<B extends DisplayBuilder> {
    private fields: DisplayField[];

    private edit_button: HTMLButtonElement;
    private confirm_buttons: HTMLDivElement;

    private title: HTMLDivElement;
    private title_input: HTMLInputElement;

    private builder: B;

    private constructor(id: string, builder: B) {
        console.debug(`Creating Display "${id}"`);

        this.builder = builder;
    }

    public static async create<B extends DisplayBuilder>(id: string, builder: B): Promise<Display<B>> {
        let target = document.getElementById(id);

        // Create the display
        let display = new Display(id, builder);

        // Create the title
        let title_container = document.createElement("h2");

        display.title = document.createElement("div");
        display.title.innerHTML = builder.get_title();
        title_container.appendChild(display.title);

        display.title_input = document.createElement("input");
        display.title_input.type = "text";
        display.title_input.maxLength = builder.get_title_max_length();
        display.title_input.style.display = "none";
        title_container.appendChild(display.title_input);

        target.appendChild(title_container);

        // Create the container
        let container = document.createElement("div");
        container.classList.add("info-block");

        // Create the labels container
        let labels = document.createElement("div");
        labels.classList.add("info-labels");

        // Create the inputs container
        let inputs = document.createElement("div");
        inputs.classList.add("info-inputs");

        // Fill in the fields
        display.fields = builder.get_fields();
        for (let field of display.fields) {
            labels.appendChild(field.get_label().get_element());

            inputs.appendChild(field.get_input().get_element());
        }

        // Append labels and inputs to container
        container.appendChild(labels);
        container.appendChild(inputs);

        // Attach container to DOM
        target.appendChild(container);

        // Create buttons
        display.edit_button = document.createElement("button");
        display.edit_button.innerText = "Edit";
        display.edit_button.onclick = () => { display.begin_edit(); };
        target.appendChild(display.edit_button);

        display.confirm_buttons = document.createElement("div");
        display.confirm_buttons.style.display = "none";

        let confirm = document.createElement("button");
        confirm.innerText = "Confirm";
        confirm.onclick = () => { display.confirm_edit(); };
        display.confirm_buttons.appendChild(confirm);

        let cancel = document.createElement("button");
        cancel.innerText = "Cancel";
        cancel.onclick = () => { display.cancel_edit(); };
        display.confirm_buttons.appendChild(cancel);

        target.appendChild(display.confirm_buttons);

        return display;
    }

    private begin_edit() {
        // Update buttons
        this.edit_button.style.display = "none";
        this.confirm_buttons.style.display = "";

        // Update title
        if (this.builder.is_title_editable()) {
            this.title.style.display = "none";
            this.title_input.style.display = "";
            this.title_input.value = this.title.innerText;
        }

        // Update fields
        for (let field of this.fields)
            field.get_input().begin_edit();
    }

    private confirm_edit() {
        let result = {};
        for (let field of this.fields)
            result[field.get_name()] = field.get_input().confirm_edit();

        result[this.builder.get_title_field_name()] = this.title_input.value;
        this.title.innerText = this.title_input.value;

        this.builder.post_update(result).then(() => { this.cancel_edit(); }).catch(() => { alert("There was an error while updating"); });
    }

    private cancel_edit() {
        // Update buttons
        this.edit_button.style.display = "";
        this.confirm_buttons.style.display = "none";

        // Update title
        if (this.builder.is_title_editable()) {
            this.title.style.display = "";
            this.title_input.style.display = "none";
        }

        // Update fields        
        for (let field of this.fields)
            field.get_input().cancel_edit();
    }
}