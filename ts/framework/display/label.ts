export class Label {
    private element: HTMLLabelElement;

    public constructor(label: string) {
        this.element = document.createElement("label");
        if (label)
            this.element.innerText = `${label}:`;
    }

    public get_element(): HTMLLabelElement {
        return this.element;
    }
}