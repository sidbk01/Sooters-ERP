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

    public constructor(id: number, name: string, phone_number: string, email: string) {
        this.id = id;
        this.name = name;
        this.phone_number = phone_number;
        this.email = email;
    }

    public get_name(): string {
        return this.name;
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
                throw `"${field}" is not a valid field for and customer`;
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
                throw `"${field}" is not a valid field for and customer`;
        }
    }

    public on_click_url(): string {
        return `/customer?id=${this.id}`;
    }
}

class CustomersParser implements AjaxParser<Customer[]> {
    public parse_object(object: any): Customer[] {
        return object.map((customer) => {
            return new Customer(customer.id, customer.name, customer.phone_number, customer.email);
        });
    }
}

class CustomerNamesParser implements AjaxParser<string[]> {
    public parse_object(object: any): string[] {
        let names = [];

        for (let row of object)
            names[row.id] = row.name;

        return names;
    }
}

class CustomerParser implements AjaxParser<Customer> {
    parse_object(object: any): Customer {
        return new Customer(object.id, object.name, object.phone_number, object.email);
    }
}