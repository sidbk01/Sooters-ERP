import { Employee } from "../../model/employee";
import { Error, SelectInput, ajax } from "../index";

export class NoteCreator {
    private container: HTMLDivElement;

    private new_note: HTMLButtonElement;

    private create_container: HTMLDivElement;
    private creator: SelectInput<Employee>;
    private note_error: Error;
    private note: HTMLTextAreaElement;

    private post_url: string;

    public constructor(creator_options: Employee[], post_url: string) {
        this.post_url = post_url;

        this.container = document.createElement("div");

        this.new_note = document.createElement("button");
        this.new_note.innerText = "New Note";
        this.new_note.onclick = () => { this.begin(); };
        this.container.appendChild(this.new_note);

        this.create_container = document.createElement("div");
        this.create_container.style.display = "none";

        this.creator = new SelectInput("Creator", creator_options);
        this.create_container.appendChild(this.creator.get_element());

        this.note_error = new Error();
        this.create_container.appendChild(this.note_error.get_element());

        this.note = document.createElement("textarea");
        this.create_container.appendChild(this.note);

        let confirm = document.createElement("button");
        confirm.innerText = "Create";
        confirm.onclick = () => { this.confirm(); };
        this.create_container.appendChild(confirm);

        let cancel = document.createElement("button");
        cancel.innerText = "Cancel";
        cancel.onclick = () => { this.cancel(); };
        this.create_container.appendChild(cancel);

        this.container.appendChild(this.create_container);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    private begin() {
        this.new_note.style.display = "none";
        this.create_container.style.display = "";
        this.note.value = "";
    }

    private async confirm() {
        let note_text = this.note.value;

        try {
            if (note_text == "")
                throw "You must enter a note";
        } catch (e) {
            this.note_error.set_message(e);
            this.note.onkeydown = () => {
                this.note_error.set_message("");
                this.note.onkeydown = () => { };
            }
            throw e;
        }

        let note = {
            creator: this.creator.validate_and_get(),
            note: note_text,
        };

        await ajax("POST", this.post_url, undefined, note);

        window.location.reload();
    }

    private cancel() {
        this.new_note.style.display = "";
        this.create_container.style.display = "none";
    }
}