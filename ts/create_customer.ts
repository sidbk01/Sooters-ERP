import { PhoneInput } from "./framework/form/inputs/phone";
import { Form, FormBuilder, FormInput, TextInput } from "./framework/index";
import { Customer } from "./model/index";

class CreateCustomerBuilder implements FormBuilder {
    private first_name: TextInput;
    private last_name: TextInput;
    private email: TextInput;
    private phone_number: PhoneInput;

    private constructor() { }

    public static async create(): Promise<CreateCustomerBuilder> {
        let builder = new CreateCustomerBuilder();

        builder.first_name = new TextInput("First Name", 32, (name) => Customer.validate_name(name, "First"));
        builder.last_name = new TextInput("Last Name", 32, (name) => Customer.validate_name(name, "Last"));
        builder.email = new TextInput("E-Mail", 64, Customer.validate_email, "email");
        builder.phone_number = new PhoneInput("Phone Number");

        return builder;
    }

    public get_inputs(): FormInput[] {
        return [
            this.first_name,
            this.last_name,
            this.email,
            this.phone_number,
        ];
    }

    public collect_and_validate(): any {
        let first_name = this.first_name.validate_and_get();
        let last_name = this.last_name.validate_and_get();
        let email = this.email.validate_and_get();
        let phone_number = this.phone_number.validate_and_get();

        return {
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_number: phone_number,
        };
    }

    public get_post_url(): string {
        return "/customers/create";
    }

    public get_redirect_url(id: number): string {
        return `/customer?id=${id}`;
    }

    public get_submit_text(): string {
        return "Create";
    }
}

async function create_form() {
    let builder = await CreateCustomerBuilder.create();

    new Form("create-customer", builder);
}

create_form().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});
