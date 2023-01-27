export class FormSubmit {
    private element: HTMLInputElement;

    public constructor(id: string, text: string) {
        console.debug(`Creating FormSubmit for "${id}"`);

        this.element = document.createElement("input");
        this.element.type = "submit";
        this.element.value = text;
    }

    public get_element(): HTMLInputElement {
        return this.element;
    }
}