import { DisplayFieldInput } from "../input";

export class BlankDisplayField implements DisplayFieldInput {
    private element: HTMLDivElement;

    public constructor() {
        this.element = document.createElement("div");
    }

    public get_element(): HTMLDivElement {
        return this.element;
    }

    public begin_edit() { }

    public confirm_edit() { }

    public cancel_edit() { }

    public get_value_and_validate() {
        return undefined;
    }
}