import { Error } from "../../error";

export class InputContainer {
    private container: HTMLDivElement;
    private error: Error;

    public constructor(label: string, input: HTMLInputElement | HTMLSelectElement) {
        console.debug(`Creating InputContainer for "${label}"`)

        this.container = document.createElement("div");
        this.container.style.textAlign = "left";

        let label_element = document.createElement("label");
        label_element.innerText = `${label}:`;
        label_element.style.width = "calc(50% - min(100px, 20%))";
        label_element.style.textAlign = "right";
        label_element.style.paddingRight = "0.25rem";
        label_element.style.display = "inline-block";

        this.error = new Error();

        this.container.append(label_element);
        this.container.append(input);
        this.container.append(this.error.get_element());
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public get_error(): Error {
        return this.error;
    }
}