import { Display, DisplayBuilder, DisplayField, ajax, TextDisplayField, PhoneDisplayField } from "./framework/index";
import { Customer } from "./model/index";

declare const ID: number;

class CustomerBuilder implements DisplayBuilder {
    private customer: Customer;

    private fields: DisplayField[];

    private constructor() {
        console.debug("Creating CustomerBuilder");
    }

    public static async create(): Promise<CustomerBuilder> {
        let builder = new CustomerBuilder();

        builder.customer = await Customer.get_customer(ID);

        let email = builder.customer.get_email();
        if (!email)
            email = "";

        let phone_number = builder.customer.get_phone_number();
        if (!phone_number)
            phone_number = "";

        builder.fields = [
            new DisplayField("phone_number", "Phone Number", new PhoneDisplayField(phone_number)),
            new DisplayField("email", "E-Mail", new TextDisplayField(email, 64, Customer.validate_email, "email")),
        ];

        return builder;
    }

    public get_title(): string {
        return this.customer.get_name();
    }

    public get_fields(): DisplayField[] {
        return this.fields;
    }

    public get_title_max_length(): number {
        return 64;
    }

    public get_title_field_name(): string {
        return "name";
    }

    public validate_title(title: string) {
        if (title.length == 0)
            throw "A name is required";

        let split = title.split(' ');
        let first_name = split[0];
        let last_name = "";
        for (let i = 1; i < split.length; i++) {
            last_name += split[i];
            if (i != split.length - 1)
                last_name += ' ';
        }

        if (first_name.length == 0)
            throw "A first name is required";

        if (last_name.length == 0)
            throw "A last name is required";

        if (first_name.length > 32)
            throw "First name must not be more than 32 characters";

        if (last_name.length > 32)
            throw "Last name must not be more than 32 characters";
    }

    public async post_update(object: any): Promise<undefined> {
        let split = object.name.split(' ');
        object.first_name = split[0];
        object.last_name = "";
        for (let i = 1; i < split.length; i++) {
            object.last_name += split[i];
            if (i != split.length - 1)
                object.last_name += ' ';
        }

        delete object.name;

        return ajax("POST", `/customers/update/${ID}`, undefined, object);
    }
}

async function create_display() {
    let builder = await CustomerBuilder.create();

    await Display.create("customer", builder);
}

create_display().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});

// TODO: Add notes