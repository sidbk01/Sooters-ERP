export class NewEmployee {
    private name: string;
    private primary_location: Location;

    public constructor(name: string, primary_location: Location) {
        this.name = name;
        this.primary_location = primary_location;
    }

    public serialize(): any {
        return {
            name: this.name,
            primary_location: this.primary_location,
        };
    }
}