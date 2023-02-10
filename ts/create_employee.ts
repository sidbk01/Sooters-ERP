import { Form, FormBuilder, FormInput, SelectInput, TextInput } from "./framework/index";
import { initialize_logger } from "./logging";
import { Location } from "./model/index";

class CreateEmployeeBuilder implements FormBuilder {
    private name: TextInput;
    private primary_location: SelectInput<Location>;

    private constructor() { }

    public static async create(): Promise<CreateEmployeeBuilder> {
        let builder = new CreateEmployeeBuilder();

        builder.name = new TextInput("Name", 64, validate_name);
        builder.primary_location = new SelectInput("Primary Location", await Location.get_locations());

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

function validate_name(text: string) {
    if (text.length == 0)
        throw "A name is required";
    else if (text.length > 64)
        throw "Name must be less than 64 characters";
}

async function create_form() {
    initialize_logger();

    let builder = await CreateEmployeeBuilder.create();

    new Form("create-employee", builder);
}

create_form().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});
