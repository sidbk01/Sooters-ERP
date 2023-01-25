import { Form, FormBuilder, FormInput, TextInput } from "./framework/index";

class CreateEmployeeBuilder implements FormBuilder {
    private name: TextInput;

    public constructor() {
        this.name = new TextInput("Name", 64, "A name is required");
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

new Form("create-employee", new CreateEmployeeBuilder());
