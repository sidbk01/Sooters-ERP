import { BlankDisplayField, CheckboxDisplayField, DateDisplayField, Display, DisplayBuilder, DisplayField, Notes, NotesBuilder, SelectDisplayField, TextDisplayField, ajax } from "./framework/index";
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

        let envelope_id: number | string = builder.order.get_envelope_id();
        if (!envelope_id)
            envelope_id = "";

        let mark_complete = document.createElement("button");
        mark_complete.classList.add("inline-button");
        mark_complete.innerText = "Complete Order";
        mark_complete.onclick = () => {
            builder.mark_complete().then(() => {
                window.location.reload();
            }).catch((error) => {
                console.error("There was an error marking complete");
                console.error(error);
                alert("There was an error while completing the order");
            });
        }

        let date_complete = builder.order.get_date_complete();
        let date_complete_field;
        if (!date_complete)
            date_complete_field = new DisplayField("", "Date Complete", new TextDisplayField("Not Complete", 0), mark_complete);
        else
            date_complete_field = new DisplayField("", "Date Complete", new DateDisplayField(date_complete));

        let mark_picked_up = document.createElement("button");
        mark_picked_up.classList.add("inline-button");
        mark_picked_up.innerText = "Set Picked Up";
        mark_picked_up.onclick = () => {
            builder.mark_picked_up().then(() => {
                window.location.reload();
            }).catch((error) => {
                console.error("There was an error marking picked up");
                console.error(error);
                alert("There was an error while setting picked up");
            });
        }

        let current_location_field;
        if (builder.order.is_picked_up())
            current_location_field = new DisplayField("", "Current Location", new TextDisplayField("Picked Up", 0));
        else
            current_location_field = new DisplayField("current_location", "Current Location", new SelectDisplayField(await Location.get_locations(), builder.order.get_current_location()), mark_picked_up);

        builder.fields = [
            new DisplayField("", "Order ID", new TextDisplayField(builder.order.get_formatted_id(), 0)),
            new DisplayField("envelope_id", "Envelope ID", new TextDisplayField(envelope_id.toString(), 6, undefined, "number")),
            new DisplayField("", "Customer", new TextDisplayField(customer_name, 0)),
            new DisplayField("", "Date Received", new TextDisplayField(builder.order.get_date_received(), 0)),
            new DisplayField("date_due", "Date Due", new DateDisplayField(builder.order.get_date_due(), "A due date is required")),
            new DisplayField("rush", "Rush", new CheckboxDisplayField(builder.order.is_rush())),
            date_complete_field,
            current_location_field,
            new DisplayField("source_location", "Source Location", new SelectDisplayField(await Location.get_locations(), builder.order.get_source_location())),
            new DisplayField("receiver", "Receiving Employee", new SelectDisplayField(await Employee.get_employees(true), builder.order.get_receiver())),
            new DisplayField("paid", "Paid", new CheckboxDisplayField(builder.order.is_paid())),
            new DisplayField("", "", new BlankDisplayField()),
        ].concat(builder.order.get_order_type_display_fields());

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
        object.order_type = {};
        let order_type_name = this.order.get_order_type().get_enum_name();
        object.order_type[order_type_name] = {};

        if (this.order.is_picked_up())
            object.current_location = this.order.get_current_location();

        for (let key in object) {
            if (!key.startsWith("order_info_"))
                continue;

            object.order_type[order_type_name][key.slice(11)] = object[key];
            delete object[key];
        }

        return ajax("POST", `/orders/update/${ID}`, undefined, object);
    }

    private async mark_complete() {
        return ajax("POST", `/order/completed?id=${ID}`);
    }

    private async mark_picked_up() {
        return ajax("POST", `/order/picked_up?id=${ID}`);
    }
}

class OrderNotesBuilder implements NotesBuilder {
    private id: number;

    public constructor(id: number) {
        this.id = id;
    }

    public get_data_url(): string {
        return `/orders/${this.id}/notes`;
    }

    public get_post_url(): string {
        return `/orders/${this.id}/notes/create`;
    }
}

async function create_display() {
    let builder = await OrderBuilder.create();
    await Display.create("order", builder);

    let notes_builder = new OrderNotesBuilder(ID);
    await Notes.create("order-notes", notes_builder);
}

create_display().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});