import { ExtraFilterInput, Table, TableBuilder, TableColumn, ajax } from "./framework/index";
import { initialize_logger } from "./logging";
import { OrderType, Order, OrdersParser, Location } from "./model/index";
import { Preferences } from "./preferences";

declare const ID: number;

class CustomerOrdersBuilder implements TableBuilder<Order> {
    private values: Order[];

    private constructor() {
        console.debug(`Creating CustomerOrdersBuilder`);
    }

    public static async create(): Promise<CustomerOrdersBuilder> {
        let builder = new CustomerOrdersBuilder();

        builder.values = await ajax("GET", `/orders/customer?id=${ID}`, new OrdersParser());

        return builder;
    }

    public async get_columns(): Promise<TableColumn[]> {
        return [
            new TableColumn("ID", "id"),
            new TableColumn("Customer", "customer"),
            new TableColumn("Date Received", "date_received"),
            new TableColumn("Type", "type", true, [OrderType.get_order_types().map((order_type) => { return order_type.to_filter_option(); }), "Select Type"]),
            new TableColumn("Due Date", "date_due"),
            new TableColumn("Status", "status", true, [Order.get_status_options(true), "Select Status"])
        ];
    }

    public get_values(): Order[] {
        return this.values;
    }

    public async get_extra_filter_input(): Promise<ExtraFilterInput | undefined> {
        return new ExtraFilterInput("Source Location", "source_location", await Location.get_location_filter_options(), Preferences.get().get_location());
    }
}

async function create_table() {
    initialize_logger();

    let builder = await CustomerOrdersBuilder.create();

    await Table.create("orders", builder);
}

create_table().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});

