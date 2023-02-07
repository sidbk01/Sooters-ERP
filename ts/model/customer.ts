import { AjaxParser, TableValue, ajax } from "../framework/index";

export class Customer implements TableValue {
    private static customers?: Customer[];
    private static customer_names?: string[];

    private id: number;
    private name: string;
    private phone_number?: string;
    private email?: string;

    public static async get_customers(): Promise<Customer[]> {
        if (!this.customers) {
            console.debug("Getting customers");
            this.customers = await ajax("GET", "/customers/data", new CustomersParser());
        }

        return this.customers;
    }

    public static async get_customer_name(id: number): Promise<string> {
        if (!this.customer_names)
            this.customer_names = await ajax("GET", "/customers/names", new CustomerNamesParser());

        return this.customer_names[id];
    }

    public static async get_customer(id: number): Promise<Customer> {
        return ajax("GET", `/customer/data?id=${id}`, new CustomerParser());
    }

    public static validate_name(text: string, which: string) {
        if (text.length == 0)
            throw `A ${which.toLowerCase()} name is required`;

        if (text.length > 32)
            throw `${which} name must be less than 32 characters`;
    }

    public static validate_email(text: string) {
        const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

        if (text.length == 0)
            return;

        if (text.length > 64)
            throw "E-Mail must be less than 64 characters";

        if (!text.match(email_regex))
            throw "Invalid E-Mail address";
    }


    public constructor(id: number, name: string, phone_number: string, email: string) {
        this.id = id;
        this.name = name;
        this.phone_number = phone_number;
        this.email = email;
    }

    public get_name(): string {
        return this.name;
    }

    public get_email(): string | undefined {
        return this.email;
    }

    public get_phone_number(): string | undefined {
        return this.phone_number;
    }

    public async render_field(field: string): Promise<string | HTMLElement> {
        switch (field) {
            case "name":
                return this.name;

            case "phone_number":
                if (!this.phone_number)
                    return "";

                return this.phone_number;

            case "email":
                if (!this.email)
                    return "";

                return this.email;

            default:
                throw `"${field}" is not a valid field for a customer`;
        }
    }

    public filter(field: string, value: any): boolean {
        switch (field) {
            case "name":
                return this.name == value;

            case "phone_number":
                return this.phone_number == value;

            case "e-mail":
                return this.email == value;

            default:
                throw `"${field}" is not a valid field for a customer`;
        }
    }

    public on_click_url(): string {
        return `/customer?id=${this.id}`;
    }
}

class CustomersParser implements AjaxParser<Customer[]> {
    public async parse_object(object: any): Promise<Customer[]> {
        return object.map((customer) => {
            return new Customer(customer.id, customer.name, customer.phone_number, customer.email);
        });
    }
}

class CustomerNamesParser implements AjaxParser<string[]> {
    public async parse_object(object: any): Promise<string[]> {
        let names = [];

        for (let row of object)
            names[row.id] = row.name;

        return names;
    }
}

class CustomerParser implements AjaxParser<Customer> {
    public async parse_object(object: any): Promise<Customer> {
        return new Customer(object.id, object.name, object.phone_number, object.email);
    }
}