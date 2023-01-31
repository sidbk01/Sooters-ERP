import { Table, TableBuilder, TableColumn, ajax } from "./framework/index";
import { OrderTypes, Order, OrdersParser } from "./model/index";

class UpcomingOrdersBuilder implements TableBuilder<Order> {
    private values: Order[];

    private constructor() { }

    public static async create(): Promise<UpcomingOrdersBuilder> {
        let builder = new UpcomingOrdersBuilder();

        builder.values = await ajax("GET", `/orders/upcoming`, new OrdersParser());

        return builder;
    }

    public async get_columns(): Promise<TableColumn[]> {
        return [
            new TableColumn("ID", "id"),
            new TableColumn("Customer", "customer"),
            new TableColumn("Date Received", "date_received"),
            new TableColumn("Type", "type", true, [OrderTypes.get_order_types().map((order_type) => { return order_type.to_filter_option(); }), "Select Type"]),
            new TableColumn("Due Date", "date_due"),
            new TableColumn("Status", "status", true, [Order.get_status_options(false), "Select Status"])
        ];
    }

    public get_values(): Order[] {
        return [

        ];
    }
}

async function create_table() {
    let builder = await UpcomingOrdersBuilder.create();

    await Table.create("upcoming-orders", builder);
}

create_table().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});

