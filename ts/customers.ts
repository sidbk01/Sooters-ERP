import { ExtraFilterInput, Table, TableBuilder, TableColumn, ajax } from "./framework/index";
import { initialize_logger } from "./logging";
import { Customer } from "./model/index";

class CustomersBuilder implements TableBuilder<Customer> {
    private customers: Customer[];

    private constructor() {
        console.debug("Creating CustomersBuilder");
    }

    public static async create(): Promise<CustomersBuilder> {
        let builder = new CustomersBuilder();

        builder.customers = await Customer.get_customers();

        return builder;
    }

    public async get_columns(): Promise<TableColumn[]> {
        return [
            new TableColumn("Name", "name"),
            new TableColumn("Phone Number", "phone_number"),
            new TableColumn("E-Mail", "email"),
        ];
    }

    public get_values(): Customer[] {
        return this.customers;
    }

    public async get_extra_filter_input(): Promise<ExtraFilterInput | undefined> {
        return undefined;
    }
}

async function create_table() {
    initialize_logger();

    let builder = await CustomersBuilder.create();

    await Table.create("customers", builder);
}

create_table().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});
;
