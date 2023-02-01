export interface DisplayFieldInput {
    get_element(): HTMLDivElement;
    begin_edit();
    get_value_and_validate(): any;
    confirm_edit();
    cancel_edit();
}