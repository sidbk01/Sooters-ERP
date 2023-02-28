import { DisplayFieldInput, Error, ajax } from "../../framework/index";

declare const ID: number;

export class FilmScanCodeInput implements DisplayFieldInput {
    private container: HTMLDivElement;

    private field_container: HTMLDivElement;
    private header_container?: HTMLDivElement;
    private scancodes: ScancodeInput[];

    private add_button: HTMLButtonElement;
    private confirm_button?: HTMLButtonElement;
    private cancel_button?: HTMLButtonElement;

    public constructor() {
        this.container = document.createElement("div");

        this.field_container = document.createElement("div");
        this.container.appendChild(this.field_container);

        this.add_button = document.createElement("button");
        this.add_button.innerText = "Add Scancode";
        this.add_button.onclick = () => { this.add_scancode() };
        this.container.appendChild(this.add_button);

        this.scancodes = [];
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public begin_edit() { }
    public get_value_and_validate() { }
    public confirm_edit() { }
    public cancel_edit() { }

    private add_scancode() {
        if (!this.confirm_button) {
            this.confirm_button = document.createElement("button");
            this.confirm_button.innerText = "Confirm";
            this.confirm_button.classList.add("confirm-button");
            this.confirm_button.onclick = () => { this.confirm() };
            this.container.appendChild(this.confirm_button);

            this.cancel_button = document.createElement("button");
            this.cancel_button.innerText = "Cancel";
            this.cancel_button.classList.add("cancel-button");
            this.cancel_button.onclick = () => { this.cancel() };
            this.container.appendChild(this.cancel_button);

            this.header_container = document.createElement("div");

            let tag_header = document.createElement("div");
            tag_header.innerText = "Roll Tag";
            tag_header.style.display = "inline-block";
            tag_header.style.width = "8rem";
            this.header_container.appendChild(tag_header);

            let scancode_header = document.createElement("div");
            scancode_header.innerText = "Scancode";
            scancode_header.style.display = "inline-block";
            scancode_header.style.width = "11rem";
            this.header_container.appendChild(scancode_header);

            this.field_container.appendChild(this.header_container);
        }

        let new_scancode = new ScancodeInput();
        this.field_container.appendChild(new_scancode.get_element());
        this.scancodes.push(new_scancode);
    }

    private confirm() {
        let new_scancodes = this.scancodes.map((scancode) => { return scancode.validate_and_get(); });

        ajax(`POST`, `/orders/film_scancodes?id=${ID}`, undefined, new_scancodes).then(() => {
            window.location.reload();
        }).catch((e) => {
            console.error("An error ocurred while adding scan codes")
            console.error(e);
            alert("An error ocurred while adding the scancodes");
        })
    }

    private cancel() {
        this.field_container.innerHTML = "";

        this.scancodes = [];

        delete this.header_container;

        this.confirm_button.remove();
        this.cancel_button.remove();
        delete this.confirm_button;
        delete this.cancel_button;
    }
}

class NewScancode {
    public tag: number;
    public scancode: String;

    public constructor(tag: number, scancode: String) {
        this.tag = tag;
        this.scancode = scancode;
    }
}

class ScancodeInput {
    private container: HTMLDivElement;

    private tag: HTMLInputElement;
    private scancode: HTMLInputElement;
    private error: Error;

    public constructor() {
        this.container = document.createElement("div");

        this.error = new Error();
        this.error.get_element().style.display = "block";
        this.container.appendChild(this.error.get_element());

        this.tag = document.createElement("input");
        this.tag.type = "number";
        this.tag.style.width = "7rem";
        this.tag.style.marginRight = "1rem";
        this.container.appendChild(this.tag);

        this.scancode = document.createElement("input");
        this.scancode.type = "text";
        this.scancode.style.width = "11rem";
        this.container.appendChild(this.scancode);

    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public validate_and_get(): NewScancode {
        try {
            let tag = this.tag.valueAsNumber;
            if (Number.isNaN(tag))
                throw "A tag is required!";
            if (tag < 0)
                throw "Tag must be positive!";

            let scancode = this.scancode.value;
            if (scancode == "")
                throw "A scancode is required!";

            return new NewScancode(tag, scancode);
        } catch (e) {
            this.error.set_message(e);
            this.tag.onkeydown = () => { this.on_key_down(); };
            this.scancode.onkeydown = () => { this.on_key_down(); };
            throw e;
        }
    }

    private on_key_down() {
        this.error.set_message("");
        this.tag.onkeydown = () => { };
        this.scancode.onkeydown = () => { };
    }
}