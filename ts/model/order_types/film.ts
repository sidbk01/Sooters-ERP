import { OrderTypeInfo } from "./type";

export enum Prints {
    None,
    Glossy,
    Matte,
}

export class FilmOrder implements OrderTypeInfo {
    private prints: Prints;
    private digital: boolean;

    private constructor(prints: Prints, digital: boolean) {
        this.prints = prints;
        this.digital = digital;
    }

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
}