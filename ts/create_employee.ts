import { Form, FormBuilder, FormInput, TextInput } from "./framework/index";
import { Location } from "./model/location";

class CreateEmployeeBuilder implements FormBuilder {
    private name: TextInput;

    private constructor() { }

    public static async create(): Promise<CreateEmployeeBuilder> {
        let builder = new CreateEmployeeBuilder();

        builder.name = new TextInput("Name", 64, "A name is required");

        console.log(await Location.get_locations());

        return builder;
    }

    public get_submit_text(): string {
        return "Create";
    }

    public get_inputs(): FormInput[] {
        return [
            this.name
        ];
    }

    public get_post_url(): string {
        return "/employees/create";
    }

    public collect_and_validate(): any {
        let name = this.name.validate_and_get();

        return {
            name: name,
        };
    }
}

CreateEmployeeBuilder.create().then((builder) => {
    new Form("create-employee", builder);
}).catch((error) => {
    console.log("Error while creating the builder");
    console.log(error);
    alert("There was an error initializing the page");
})

