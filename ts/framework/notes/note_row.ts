import { Note } from "./note";

export class NoteRow {
    private container: HTMLDivElement;

    public constructor(note: Note) {
        this.container = document.createElement("div");
        this.container.classList.add("note");

        let header = document.createElement("div");
        header.classList.add("note-header");

        let creator = document.createElement("div");
        creator.classList.add("note-creator");
        creator.innerText = note.get_creator();
        header.appendChild(creator);

        let date_time = document.createElement("div");
        date_time.classList.add("note-date");
        date_time.innerText = note.get_date_time();
        header.appendChild(date_time);

        this.container.appendChild(header);

        let content = document.createElement("div");
        content.classList.add("note-content");
        content.innerText = note.get_note();
        this.container.appendChild(content);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }
}