import { DisplayField, FormInput } from "../../framework/index";
import { OrderTypeInfo } from "./type";

export class PhotoRestoration implements OrderTypeInfo {
    private constructor() { }

    public get_display_fields(): DisplayField[] {
        return [];
    }

    public static get_group_inputs(): [string, FormInput][] {
        return [];
    }

    public static async get_info(id: number): Promise<OrderTypeInfo> {
        return new PhotoRestoration();
    }
}