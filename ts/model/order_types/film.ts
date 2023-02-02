import { CheckboxInput, FormInput, SelectInput, SelectOption } from "../../framework/index";
import { OrderTypeInfo } from "./type";

export enum Prints {
    None,
    Glossy,
    Matte,
}

export class FilmOrder implements OrderTypeInfo {
    private prints: Prints;
    private digital: boolean;

    public static parse(order_info: any): FilmOrder {
        let prints;
        switch (order_info.prints) {
            case 0:
                prints = Prints.None;
                break;

            case 1:
                prints = Prints.Glossy;
                break;

            case 2:
                prints = Prints.Matte;
                break;

            default:
                throw `Unknown print type ${order_info.prints}`;
        }

        return new FilmOrder(prints, order_info.digital);
    }

    public static get_group_inputs(): [string, FormInput][] {
        return [
            ["prints", new SelectInput("Prints", PrintsOption.get())],
            ["digital", new CheckboxInput("Digital")],
            // TODO: Add list input for rolls
        ];
    }

    private constructor(prints: Prints, digital: boolean) {
        this.prints = prints;
        this.digital = digital;
    }
}

class PrintsOption implements SelectOption {
    private prints: Prints;

    public static get(): PrintsOption[] {
        return [
            new PrintsOption(Prints.None),
            new PrintsOption(Prints.Glossy),
            new PrintsOption(Prints.Matte),
        ];
    }

    private constructor(prints: Prints) {
        this.prints = prints;
    }

    public get_select_text(): string {
        switch (this.prints) {
            case Prints.None:
                return "None";

            case Prints.Glossy:
                return "Glossy";

            case Prints.Matte:
                return "Matte";
        }
    }

    public get_select_value(): number {
        return this.prints as number;
    }
}