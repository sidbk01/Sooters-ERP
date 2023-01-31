import { OrderTypeInfo } from "./type";

export class FramingOrder implements OrderTypeInfo {
    private category: string;
    private width: number;
    private height: number;

    private constructor(category: string, width: number, height: number) {
        this.category = category;
        this.width = width;
        this.height = height;
    }

    public static parse(order_info: any): FramingOrder {
        return new FramingOrder(order_info.category, order_info.width, order_info.height);
    }
}