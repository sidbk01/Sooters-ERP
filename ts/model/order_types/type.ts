import { FilterOption, FormInput, GroupOption, SelectOption } from "../../framework/index";
import { FilmOrder } from "./film";
import { FramingOrder } from "./framing";
import { Photoshoot } from "./photoshoot";

export interface OrderTypeInfo {

}

enum OrderTypeInner {
    Film = 1,
    Framing,
    Photoshoot,
}

export class OrderType implements GroupOption {
    private type: OrderTypeInner;

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
}