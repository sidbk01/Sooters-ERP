import { Form, FormBuilder, FormInput, SelectInput, TextInput } from "./framework/index";
import { Location } from "./model/index";

class CreateEmployeeBuilder implements FormBuilder {
    private name: TextInput;
    private primary_location: SelectInput<Location>;

    private constructor() { }

    public static async create(): Promise<CreateEmployeeBuilder> {
        let builder = new CreateEmployeeBuilder();

        builder.name = new TextInput("Name", 64, "A name is required");
        builder.primary_location = new SelectInput("Primary Location", "A location is required", await Location.get_locations());

        return builder;
    }

    public get_inputs(): FormInput[] {
        return [
            this.name,
            this.primary_location,
        ];
    }

    public collect_and_validate(): any {
        let name = this.name.validate_and_get();
        let primary_location = this.primary_location.validate_and_get();

        return {
            name: name,
            primary_location: primary_location,
        };
    }

    public get_post_url(): string {
        return "/employees/create";
    }

    public get_redirect_url(id: number): string {
        return `/employee?id=${id}`;
    }

    public get_submit_text(): string {
        return "Create";
    }
}

CreateEmployeeBuilder.create().then((builder) => {
    new Form("create-employee", builder);
}).catch((error) => {
    console.log("Error while creating the builder");
    console.log(error);
    alert("There was an error initializing the page");
})

