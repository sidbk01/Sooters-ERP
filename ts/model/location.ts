import { ajax, AjaxParser, SelectOption } from "../framework/index";

class LocationsParser implements AjaxParser<Location[]> {
    parse_object(object: any): Location[] {
        let output = [];

        for (let inner of object)
            output.push(new Location(inner.id, inner.name, inner.address));

        return output;
    }
}

export class Location implements SelectOption {
    private id: number;
    private name: string;
    private address: number;

    private static locations?: Location[];

    public constructor(id: number, name: string, address: number) {
        this.id = id;
        this.name = name;
        this.address = address;
    }

    public static async get_locations(): Promise<Location[]> {
        if (!Location.locations)
            Location.locations = await ajax<Location[], LocationsParser>("GET", "/locations", new LocationsParser());

        return Location.locations;
    }

    public get_select_text(): string {
        return this.name;
    }

    public get_select_value(): number {
        return this.id;
    }
}