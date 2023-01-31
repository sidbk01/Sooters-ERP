export interface TableValue {
    render_field(field: string): Promise<HTMLElement | string>;
    on_click_url(current_path: string): string;

    filter(field: string, value: any): boolean;
}