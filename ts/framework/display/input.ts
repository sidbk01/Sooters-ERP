export interface DisplayFieldInput {
    get_element(): HTMLDivElement;
    begin_edit();
    confirm_edit(): any;
    cancel_edit();
}