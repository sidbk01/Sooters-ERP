import { Employee } from "../../model/employee";
import { AjaxParser, ajax } from "../ajax";
import { NotesBuilder } from "./builder";
import { NoteCreator } from "./creator";
import { NoteList } from "./list";
import { Note } from "./note";

export class Notes<B extends NotesBuilder> {
    private constructor() {
        console.debug(`Creating Notes`);
    }

    public static async create<B extends NotesBuilder>(id: string, builder: B): Promise<Notes<B>> {
        let notes = new Notes();

        let container = document.createElement("div");

        // Create header
        let header = document.createElement("h3");
        header.innerText = "Notes";
        container.appendChild(header);

        // Create creator
        let creator = new NoteCreator(await Employee.get_employees(true), builder.get_post_url());
        container.appendChild(creator.get_element());

        // Get notes
        let notes_data = await ajax<Note[], NotesParser>("GET", builder.get_data_url(), new NotesParser());

        // Create list
        let list = new NoteList(notes_data);
        container.appendChild(list.get_element());

        // Attach the notes to the DOM
        let target = document.getElementById(id);
        target.parentNode.replaceChild(container, target);

        return notes;
    }
}

class NotesParser implements AjaxParser<Note[]> {
    public constructor() { }

    public async parse_object(object: any): Promise<Note[]> {
        let output = [];
        for (let note of object) {
            output.push(new Note((await Employee.get_employee(note.creator)).get_name(), note.date_time, note.note));
        }

        return output;
    }
}