export class Error {
    private element: HTMLParagraphElement;

    public constructor() {
        this.element = document.createElement("p");
        this.element.className = "error";
        this.element.innerText = "";
    }

    public get_element(): HTMLParagraphElement {
        return this.element;
    }

    public get_message(): string {
        return this.element.innerText;
    }

    public set_message(message: string) {
        this.element.innerText = message;
    }
}