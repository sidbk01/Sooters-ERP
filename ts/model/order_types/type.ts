import { DisplayField, FilterOption, FormInput, GroupOption, SelectOption, TextDisplayField } from "../../framework/index";
import { FilmOrder } from "./film";
import { FramingOrder } from "./framing";
import { Photoshoot } from "./photoshoot";

export interface OrderTypeInfo {
    get_display_fields(): DisplayField[];
}

enum OrderTypeInner {
    Film = 1,
    Framing,
    Photoshoot,
    // TODO: Add photo resoration
}

export class OrderType implements GroupOption {
    private type: OrderTypeInner;
    private info?: OrderTypeInfo;

    public static get_order_types(): OrderType[] {
        return [
            new OrderType(OrderTypeInner.Film),
            new OrderType(OrderTypeInner.Framing),
            new OrderType(OrderTypeInner.Photoshoot),
        ];
    }

    public static parse(order: any): OrderType {
        switch (order.order_type) {
            case 1:
                return new OrderType(OrderTypeInner.Film);

            case 2:
                return new OrderType(OrderTypeInner.Framing);

            case 3:
                return new OrderType(OrderTypeInner.Photoshoot);

            default:
                throw `Unknown order type "${order.order_type}"`;
        }
    }

    public static async parse_full(order: any): Promise<OrderType> {
        let order_type = this.parse(order);
        order_type.info = await order_type.get_info(order.id);

        return order_type;
    }

    public constructor(type: OrderTypeInner) {
        this.type = type;
    }

    public to_filter_option(): FilterOption {
        switch (this.type) {
            case OrderTypeInner.Film:
                return new FilterOption("Film", OrderTypeInner.Film);

            case OrderTypeInner.Framing:
                return new FilterOption("Custom Framing", OrderTypeInner.Framing);

            case OrderTypeInner.Photoshoot:
                return new FilterOption("Photoshoot", OrderTypeInner.Photoshoot);
        }
    }

    public to_string(): string {
        switch (this.type) {
            case OrderTypeInner.Film:
                return "Film";

            case OrderTypeInner.Framing:
                return "Custom Framing";

            case OrderTypeInner.Photoshoot:
                return "Photoshoot";
        }
    }

    public get_select_text(): string {
        return this.to_string();
    }

    public get_select_value(): number {
        return this.type as number;
    }

    public get_inputs(): [string, FormInput][] {
        switch (this.type) {
            case OrderTypeInner.Film:
                return FilmOrder.get_group_inputs();

            case OrderTypeInner.Framing:
                return FramingOrder.get_group_inputs();

            case OrderTypeInner.Photoshoot:
                return Photoshoot.get_group_inputs();
        }
    }

    public get_enum_name(): string {
        switch (this.type) {
            case OrderTypeInner.Film:
                return "Film";

            case OrderTypeInner.Framing:
                return "Framing";

            case OrderTypeInner.Photoshoot:
                return "Photoshoot";
        }
    }

    public async get_info(id: number): Promise<OrderTypeInfo> {
        switch (this.type) {
            case OrderTypeInner.Film:
                return FilmOrder.get_info(id);

            case OrderTypeInner.Framing:
                return FramingOrder.get_info(id);

            case OrderTypeInner.Photoshoot:
                return Photoshoot.get_info(id);
        }
    }

    public get_display_fields(): DisplayField[] {
        return [
            new DisplayField("", "Type", new TextDisplayField(this.to_string(), 0))
        ].concat(this.info.get_display_fields());
    }
}