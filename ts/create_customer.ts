import { Form, FormBuilder, FormInput, TextInput } from "./framework/index";

class CreateCustomerBuilder implements FormBuilder {
    private first_name: TextInput;
    private last_name: TextInput;
    private email: TextInput;
    private phone_number: TextInput; // TODO: Change this to a phone-number input

    private constructor() { }

    public static async create(): Promise<CreateCustomerBuilder> {
        let builder = new CreateCustomerBuilder();

        builder.first_name = new TextInput("First Name", 32, (name) => validate_name(name, "First"));
        builder.last_name = new TextInput("Last Name", 32, (name) => validate_name(name, "Last"));
        builder.email = new TextInput("E-Mail", 64, validate_email);
        builder.phone_number = new TextInput("Phone Number", 32, validate_phone_number);

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

function validate_name(text: string, which: string) {
    if (text.length == 0)
        throw `A ${which.toLowerCase()} name is required`;

    if (text.length > 32)
        throw `${which} name must be less than 32 characters`;
}

function validate_email(text: string) {
    if (text.length == 0)
        return;

    if (text.length > 64)
        throw "E-Mail must be less than 64 characters";

    // TODO: Validate email
}

function validate_phone_number(text: string) {
    if (text.length == 0)
        return;

    if (text.length > 32)
        throw "Phone number must be less than 32 characters";

    // TODO: Validate phone number
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
