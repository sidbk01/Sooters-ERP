import { AjaxParser, ajax } from "../../framework/index";

export class FilmScanCode {
    private id: number;
    private tag: number;
    private scancode: String;

    public static async get_scancodes(id: number): Promise<FilmScanCode[]> {
        return ajax("GET", `/orders/film_scancodes?id=${id}`, new FilmScanCodesParser());
    }

    public constructor(id: number, tag: number, scancode: String) {
        this.id = id;
        this.tag = tag;
        this.scancode = scancode;
    }

    public get_scancode(): String {
        return this.scancode;
    }

    public get_tag(): number {
        return this.tag;
    }
}

class FilmScanCodesParser implements AjaxParser<FilmScanCode[]> {
    public constructor() { }

    public async parse_object(object: any): Promise<FilmScanCode[]> {
        return object.map((scancode) => {
            return new FilmScanCode(
                scancode.id,
                scancode.tag,
                scancode.scancode,
            );
        });
    }
}