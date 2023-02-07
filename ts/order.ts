import { CheckboxDisplayField, DateDisplayField, Display, DisplayBuilder, DisplayField, SelectDisplayField, TextDisplayField, ajax } from "./framework/index";
import { Customer } from "./model/customer";
import { Employee } from "./model/employee";
import { Location } from "./model/location";
import { Order } from "./model/order";

declare const ID: number;

class OrderBuilder implements DisplayBuilder {
    private order: Order;
    private fields: DisplayField[];

    private constructor() {
        console.debug("Creating OrderBuilder");
    }

    public static async create(): Promise<OrderBuilder> {
        let builder = new OrderBuilder();

        builder.order = await Order.get_order(ID);

        let customer_name = await Customer.get_customer_name(builder.order.get_customer());

        let envelope_id = builder.order.get_envelope_id();
        if (typeof envelope_id === "undefined")
            envelope_id = 0;

        let date_complete = builder.order.get_date_complete();
        let date_complete_field;
        if (!date_complete)
            date_complete_field = new TextDisplayField("Not Complete", 0);
        else
            date_complete_field = new DateDisplayField(date_complete);

        let current_location_field;
        if (builder.order.is_picked_up())
            current_location_field = new TextDisplayField("Picked Up", 0);
        else
            current_location_field = new SelectDisplayField(await Location.get_locations(), builder.order.get_current_location());

        builder.fields = [
            new DisplayField("", "Order ID", new TextDisplayField(builder.order.get_formatted_id(), 0)),
            new DisplayField("envelope_id", "Envelope ID", new TextDisplayField(envelope_id.toString(), 6, undefined, "number")),
            new DisplayField("", "Customer", new TextDisplayField(customer_name, 0)),
            new DisplayField("", "Date Received", new TextDisplayField(builder.order.get_date_received(), 0)),
            new DisplayField("date_due", "Date Due", new DateDisplayField(builder.order.get_date_due(), "A due date is required")),
            new DisplayField("rush", "Rush", new CheckboxDisplayField(builder.order.is_rush())),
            new DisplayField("", "Date Complete", date_complete_field),
            new DisplayField("current_location", "Current Location", current_location_field),
            new DisplayField("source_location", "Source Location", new SelectDisplayField(await Location.get_locations(), builder.order.get_source_location())),
            new DisplayField("receiver", "Receiving Employee", new SelectDisplayField(await Employee.get_employees(true), builder.order.get_receiver())),
            new DisplayField("paid", "Paid", new CheckboxDisplayField(builder.order.is_paid())),
        ];

        return builder;
    }

    public get_title(): string {
        return "Order";
    }

    public get_fields(): DisplayField[] {
        return this.fields;
    }

    public get_title_max_length(): number {
        return 0;
    }

    public get_title_field_name(): string {
        return "";
    }

    public validate_title(title: string) {
        throw "Title is not editable!";
    }

    public async post_update(object: any): Promise<undefined> {
        console.info(object);

        return ajax("POST", `/orders/update/${ID}`);
    }
}

async function create_display() {
    let builder = await OrderBuilder.create();

    await Display.create("order", builder);
}

create_display().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});