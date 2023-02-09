import { DisplayFieldInput } from "./input";
import { Label } from "./label";

export class DisplayField {
    private name: string;
    private label: Label;

    private input_container: HTMLDivElement;
    private input: DisplayFieldInput;

    public constructor(name: string, label: string, input: DisplayFieldInput, side_button?: HTMLButtonElement) {
        this.name = name;
        this.label = new Label(label);

        this.input_container = document.createElement("div");

        this.input = input;
        this.input.get_element().style.display = "inline-block";
        this.input_container.appendChild(this.input.get_element());

        if (side_button)
            this.input_container.appendChild(side_button);
    }

    public get_name(): string {
        return this.name;
    }

    public get_label(): Label {
        return this.label;
    }

    public get_input(): DisplayFieldInput {
        return this.input;
    }

    public get_input_container(): HTMLDivElement {
        return this.input_container; ``
    }
}