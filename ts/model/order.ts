import { AjaxParser, FilterOption, TableValue, ajax } from "../framework/index";
import { Customer } from "./customer";
import { OrderType, OrderTypeInfo } from "./order_types/index";

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
    private status: number;

    private order_type_info?: OrderTypeInfo;

    public static async get_order(id: number): Promise<Order> {
        return ajax("GET", `/order/data?id=${id}`, new OrderParser());
    }

    public static get_status_options(initial_complete = true): FilterOption[] {
        return [
            new FilterOption("Not Complete", OrderStatus.NotComplete, true),
            new FilterOption("Complete", OrderStatus.Complete, initial_complete),
            new FilterOption("Picked Up", OrderStatus.PickedUp, initial_complete),
        ];
    }

    public constructor(id: number, current_location: number, source_location: number, receiver: number, order_type: OrderType, customer: number, date_received: string, date_due: string, paid: boolean, rush: boolean, picked_up: boolean,
        formatted_id: string, envelope_id?: number, date_complete?: string, order_type_info?: OrderTypeInfo) {
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
        this.envelope_id = envelope_id;
        this.date_complete = date_complete;
        this.order_type_info = order_type_info;

        if (!this.date_complete)
            this.status = 0;
        else {
            if (!this.picked_up)
                this.status = 1;
            else
                this.status = 2;
        }
    }

    public get_envelope_id(): number | undefined {
        return this.envelope_id;
    }

    public get_current_location(): number {
        return this.current_location;
    }

    public get_source_location(): number {
        return this.source_location;
    }

    public get_receiver(): number {
        return this.receiver;
    }

    public get_customer(): number {
        return this.customer;
    }

    public get_date_received(): string {
        return this.date_received;
    }

    public get_date_due(): string {
        return this.date_due;
    }

    public get_date_complete(): string | undefined {
        return this.date_complete;
    }

    public is_rush(): boolean {
        return this.rush;
    }

    public is_paid(): boolean {
        return this.paid;
    }

    public is_picked_up(): boolean {
        return this.picked_up;
    }

    public get_formatted_id(): string {
        return this.formatted_id;
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

                if (this.status == 0) {
                    status = "Not Complete";
                    dot.style.backgroundColor = "red";
                } else if (this.status == 1) {
                    status = "Complete";
                    dot.style.backgroundColor = "green";
                } else {
                    dot.style.backgroundColor = "blue";
                    status = "Picked Up";
                }

                container.appendChild(document.createTextNode(status));
                container.appendChild(dot);
                return container;

            default:
                throw `"${field}" is not a valid field for an order`;
        }
    }

    filter(field: string, value: any): boolean {
        switch (field) {
            case "type":
                return this.order_type.get_select_value() == value;

            case "status":
                return this.status == value;

            default:
                throw `"${field}" is not a valid field for an order`;
        }
    }

    on_click_url(current_path): string {
        return `/order?id=${this.id}&back=${encodeURI(current_path)}`;
    }
}

export class OrdersParser implements AjaxParser<Order[]> {
    public constructor() { }

    public async parse_object(object: any): Promise<Order[]> {
        return object.map((order) => {
            let order_type = OrderType.parse(order);
            if (typeof order.date_complete !== "undefined" && order.date_complete == "")
                order.date_complete = undefined;

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
                order.envelope_id,
                order.date_complete,
            );
        });
    }
}

export class OrderParser implements AjaxParser<Order> {
    public constructor() { }

    public async parse_object(order: any): Promise<Order> {
        let [order_type, order_type_info] = await OrderType.parse_full(order);
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
            order.envelope_id,
            order.date_complete,
            order_type_info,
        );
    }
}