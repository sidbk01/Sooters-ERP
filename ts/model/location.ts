import { ajax } from "../framework/ajax";

export class Location {
    private static locations?: Location[];

    public static async get_locations(): Promise<Location[]> {
        if (!Location.locations)
            Location.locations = await ajax("GET", "/locations");

        return Location.locations;
    }
}