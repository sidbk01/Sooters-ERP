import { FormInput, TextInput } from "../../framework/index";
import { OrderTypeInfo } from "./type";

export class FramingOrder implements OrderTypeInfo {
    private category: string;
    private width: number;
    private height: number;

    public static parse(order_info: any): FramingOrder {
        return new FramingOrder(order_info.category, order_info.width, order_info.height);
    }

    public static get_group_inputs(): [string, FormInput][] {
        return [
            ["category", new TextInput("Category", 10, (text) => { verify_exists(text, "A category is required") })],
            ["width", new TextInput("Width", 3, (text) => { verify_exists(text, "A width is required") }, "number")],
            ["height", new TextInput("Height", 3, (text) => { verify_exists(text, "A height is required") }, "number")],
        ];
    }

    private constructor(category: string, width: number, height: number) {
        this.category = category;
        this.width = width;
        this.height = height;
    }
}

function verify_exists(value: string, error_message: string) {
    if (value == "")
        throw error_message;
}