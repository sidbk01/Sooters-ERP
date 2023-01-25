export class Error {
    private element: HTMLParagraphElement;
    private visible: boolean;

    public constructor(message: string) {
        this.element = document.createElement("p");
        this.element.className = "error";
        this.element.innerText = message;
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

    public is_visible(): boolean {
        return this.visible;
    }

    public set_visible(visible: boolean) {
        this.element.style.display = visible ? "block" : "none";
        this.visible = visible;
    }
}