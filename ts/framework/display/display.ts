import { DisplayBuilder } from "./builder";
import { DisplayButtons } from "./buttons";
import { DisplayField } from "./field";
import { DisplayTitle } from "./title";

export class Display<B extends DisplayBuilder> {
    private title: DisplayTitle;
    private fields: DisplayField[];
    private buttons: DisplayButtons<B>;

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
        display.title = new DisplayTitle(builder);
        target.appendChild(display.title.get_element());

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
            inputs.appendChild(field.get_input_container());
        }

        // Append labels and inputs to container
        container.appendChild(labels);
        container.appendChild(inputs);

        // Attach container to DOM
        target.appendChild(container);

        // Create buttons
        display.buttons = new DisplayButtons(display);
        target.appendChild(display.buttons.get_element());

        return display;
    }

    public begin_edit() {
        // Update title
        this.title.begin_edit();

        // Update fields
        for (let field of this.fields) {
            if (field.get_name() == "")
                continue;

            field.get_input().begin_edit();
        }

        // Update buttons
        this.buttons.begin_edit();
    }

    public confirm_edit() {
        let result = {};

        // Collect result from the title
        try {
            let [field_name, title_value] = this.title.get_value_and_validate();
            if (field_name)
                result[field_name] = title_value;

            // Collect results from the fields
            for (let field of this.fields) {
                let name = field.get_name();
                if (name == "")
                    continue;

                result[name] = field.get_input().get_value_and_validate();
            }
        } catch (e) {
            console.error(`Error while validating input`);
            console.error(e);
            return;
        }

        // Give the results to the builder
        this.builder.post_update(result).then(() => {
            // Confirm the edit
            this.title.confirm_edit();
            for (let field of this.fields) {
                if (field.get_name() == "")
                    continue;

                field.get_input().confirm_edit();
            }

            this.cancel_edit();
        }).catch((e) => { alert("There was an error while updating"); throw e; });
    }

    public cancel_edit() {
        // Update title
        this.title.cancel_edit();

        // Update fields        
        for (let field of this.fields) {
            if (field.get_name() == "")
                continue;

            field.get_input().cancel_edit();
        }

        // Update buttons
        this.buttons.end_edit();
    }
}