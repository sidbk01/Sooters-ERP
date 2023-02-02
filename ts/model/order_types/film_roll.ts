import { SelectOption } from "../../framework/index";

export enum FilmType {
    Color = 1,
    BlackWhite,
    _120mm,
}

export class FilmTypeOption implements SelectOption {
    private type: FilmType;

    public static get(): FilmTypeOption[] {
        return [
            new FilmTypeOption(FilmType.Color),
            new FilmTypeOption(FilmType.BlackWhite),
            new FilmTypeOption(FilmType._120mm),
        ];
    }

    private constructor(type: FilmType) {
        this.type = type;
    }

    public get_select_text(): string {
        switch (this.type) {
            case FilmType.Color:
                return "Color";

            case FilmType.BlackWhite:
                return "Black & White";

            case FilmType._120mm:
                return "120mm";
        }
    }

    public get_select_value(): number {
        return this.type as number;
    }
}