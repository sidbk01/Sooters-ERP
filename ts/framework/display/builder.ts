import { DisplayField } from "./field";

export interface DisplayBuilder {
    get_title(): string;
    get_fields(): DisplayField[];

    get_title_max_length(): number;
    get_title_field_name(): string;
    is_title_editable(): boolean;

    post_update(object: any): Promise<undefined>;
}