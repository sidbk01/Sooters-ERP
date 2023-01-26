export interface TableValue {
    render_field(field: string): Promise<HTMLElement | string>;
    generate_on_click(): string;

    filter(field: string, value: any): boolean;
}