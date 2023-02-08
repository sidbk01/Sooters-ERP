import { AjaxParser, DisplayField, FormInput, TextDisplayField, TextInput, ajax } from "../../framework/index";
import { OrderTypeInfo } from "./type";

export class FramingOrder implements OrderTypeInfo {
    private category: string;
    private width: number;
    private height: number;

    public static parse(order_info: any): FramingOrder {
        if (typeof order_info === "undefined")
            return;

        return new FramingOrder(order_info.category, order_info.width, order_info.height);
    }

    public static get_group_inputs(): [string, FormInput][] {
        return [
            ["category", new TextInput("Category", 10, (text) => { verify_exists(text, "A category is required") })],
            ["width", new TextInput("Width", 3, (text) => { verify_exists(text, "A width is required") }, "number")],
            ["height", new TextInput("Height", 3, (text) => { verify_exists(text, "A height is required") }, "number")],
        ];
    }

    public static async get_info(id: number): Promise<OrderTypeInfo> {
        return ajax("GET", `/orders/framing?id=${id}`, new FramingOrderParser());
    }

    public constructor(category: string, width: number, height: number) {
        this.category = category;
        this.width = width;
        this.height = height;
    }

    public get_display_fields(): DisplayField[] {
        return [
            new DisplayField("order_info_category", "Category", new TextDisplayField(this.category, 10, (text) => { verify_exists(text, "A category is required") })),
            new DisplayField("order_info_width", "Width", new TextDisplayField(this.width.toString(), 3, (text) => { verify_exists(text, "A width is required") }, "number")),
            new DisplayField("order_info_height", "Height", new TextDisplayField(this.height.toString(), 3, (text) => { verify_exists(text, "A height is required") }, "number")),

        ];
    }
}

function verify_exists(value: string, error_message: string) {
    if (value == "")
        throw error_message;
}

class FramingOrderParser implements AjaxParser<FramingOrder> {
    public constructor() { }

    public async parse_object(object: any): Promise<FramingOrder> {
        return new FramingOrder(object.category, object.width, object.height);
    }
}