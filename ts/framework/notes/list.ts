import { Note } from "./note";
import { NoteRow } from "./note_row";

export class NoteList {
    private container: HTMLDivElement;

    public constructor(notes: Note[]) {
        this.container = document.createElement("div");

        for (let note of notes) {
            let row = new NoteRow(note);
            this.container.appendChild(row.get_element());
            this.container.appendChild(document.createElement("hr"));
        }
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }
}