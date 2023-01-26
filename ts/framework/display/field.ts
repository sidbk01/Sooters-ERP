import { DisplayFieldInput } from "./input";
import { Label } from "./label";

export class DisplayField {
    private name: string;
    private label: Label;
    private input: DisplayFieldInput;

    public constructor(name: string, label: string, input: DisplayFieldInput) {
        this.name = name;
        this.label = new Label(label);
        this.input = input;
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
}