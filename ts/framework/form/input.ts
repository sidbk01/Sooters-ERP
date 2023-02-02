export interface FormInput {
    get_element(): HTMLElement;
    get_name(): string;
    validate_and_get(): any;
}