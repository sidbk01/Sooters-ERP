export class Note {
    private creator: string;
    private date_time: string;
    private note: string;

    public constructor(creator: string, date_time: string, note: string) {
        this.creator = creator;
        this.date_time = date_time;
        this.note = note;
    }

    public get_creator(): string {
        return this.creator;
    }

    public get_date_time(): string {
        return this.date_time;
    }

    public get_note(): string {
        return this.note;
    }
}
