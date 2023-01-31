export class DisplayTitle {
    private container: HTMLDivElement;
    private text: HTMLDivElement;
    private input?: HTMLInputElement;

    private field_name?: string;

    public constructor(text: string, max_length: number, field_name?: string) {
        this.field_name = field_name;

        // Create the container
        this.container = document.createElement("h2");

        // Create the text
        this.text = document.createElement("div");
        this.text.innerHTML = text;
        this.container.appendChild(this.text);

        // If needed, create the input
        if (!field_name)
            return;

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.maxLength = max_length;
        this.input.style.display = "none";
        this.container.appendChild(this.input);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public begin_edit() {
        // Only begin editing if needed
        if (!this.input)
            return;

        // Hide the text and display the input
        this.text.style.display = "none";
        this.input.style.display = "";

        // Set the input's value to the text
        this.input.value = this.text.innerText;
    }

    public confirm_edit(): [string | undefined, string] {
        if (!this.input)
            return [undefined, ""];

        this.text.innerText = this.input.value;
        return [this.field_name, this.input.value];
    }

    public cancel_edit() {
        if (!this.input)
            return;

        this.text.style.display = "";
        this.input.style.display = "none";
    }
}