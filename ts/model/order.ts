import { AjaxParser, FilterOption, TableValue } from "../framework/index";
import { Customer } from "./customer";
import { OrderType, OrderTypeInfo, OrderTypes } from "./order_types/index";

export enum OrderStatus {
    NotComplete,
    Complete,
    PickedUp,
}

export class Order implements TableValue {
    private id: number;
    private envelope_id?: number;
    private current_location: number;
    private source_location: number;
    private receiver: number;
    private order_type: OrderType;
    private customer: number;
    private date_received: string;
    private date_due: string;
    private date_complete?: string;
    private paid: boolean;
    private rush: boolean;
    private picked_up: boolean;
    private formatted_id: string;

    private order_type_info: OrderTypeInfo;

    public constructor(id: number, current_location: number, source_location: number, receiver: number, order_type: OrderType, customer: number, date_received: string, date_due: string, paid: boolean, rush: boolean, picked_up: boolean,
        formatted_id: string, order_type_info: OrderTypeInfo, envelope_id?: number, date_complete?: string) {
        this.id = id;
        this.current_location = current_location;
        this.source_location = source_location;
        this.receiver = receiver;
        this.order_type = order_type;
        this.customer = customer;
        this.date_received = date_received;
        this.date_due = date_due;
        this.paid = paid;
        this.rush = rush;
        this.picked_up = picked_up;
        this.formatted_id = formatted_id;
        this.order_type_info = order_type_info;
        this.envelope_id = envelope_id;
        this.date_complete = date_complete;
    }

    public static get_status_options(initial_complete = true): FilterOption[] {
        return [
            new FilterOption("Not Complete", OrderStatus.NotComplete, true),
            new FilterOption("Complete", OrderStatus.Complete, initial_complete),
            new FilterOption("Picked Up", OrderStatus.PickedUp, initial_complete),
        ];
    }

    public async render_field(field: string): Promise<string | HTMLElement> {
        switch (field) {
            case "id":
                return this.id.toString();

            case "customer":
                return Customer.get_customer_name(this.customer);

            case "date_received":
                return this.date_received;

            case "type":
                return this.order_type.to_string();

            case "date_due":
                return this.date_due;

            case "status":
                let container = document.createElement("div");
                let status = "";
                let dot = document.createElement("span");
                dot.classList.add("dot");

                if (!this.date_complete) {
                    status = "Not Complete";
                    dot.style.backgroundColor = "red";
                } else {
                    if (!this.picked_up) {
                        dot.style.backgroundColor = "green";
                        status = "Complete";
                    } else {
                        dot.style.backgroundColor = "blue";
                        status = "Picked Up";
                    }
                }

                container.appendChild(document.createTextNode(status));
                container.appendChild(dot);
                return container;

            default:
                throw `"${field}" is not a valid field for and employee`;
        }
    }

    filter(field: string, value: any): boolean {
        switch (field) {

            default:
                throw `"${field}" is not a valid field for and employee`;
        }
    }

    on_click_url(current_path): string {
        return `/order?id=${this.id}&back=${encodeURI(current_path)}`;
    }
}

export class OrdersParser implements AjaxParser<Order[]> {
    public constructor() { }

    parse_object(object: any): Order[] {
        return object.map((order) => {
            let [order_type, order_type_info] = OrderTypes.parse(order);
            return new Order(
                order.id,
                order.current_location,
                order.source_location,
                order.receiver,
                order_type,
                order.customer,
                order.date_received,
                order.date_due,
                order.paid,
                order.rush,
                order.picked_up,
                order.formatted_id,
                order_type_info,
                order.envelope_id,
                order.date_complete,
            );
        });
    }
}