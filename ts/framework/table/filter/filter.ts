import { TableBody } from "../body";
import { TableValue } from "../value";
import { FilterDropdown } from "./dropdown";
import { FilterImage } from "./image";
import { FilterOption } from "./option";

export class Filter {
    private image: FilterImage;
    private dropdown: FilterDropdown;

    private target: HTMLTableCellElement;

    public constructor(filter_options: FilterOption[], dropdown_title: string, index: number, body: TableBody, target: HTMLTableCellElement) {
        this.target = target;

        // Create the image
        this.image = new FilterImage(this);

        // Create the dropdown
        this.dropdown = new FilterDropdown(dropdown_title, filter_options, index, body);

        // Add the window event listener
        window.addEventListener("click", (event) => { this.window_click(event); });
    }

    public filter_value(value: TableValue, field: string): boolean {
        return this.dropdown.filter_value(value, field);
    }

    public get_image_element(): HTMLImageElement {
        return this.image.get_element();
    }

    public get_dropdown_element(): HTMLDivElement {
        return this.dropdown.get_element();
    }

    public show_dropdown(event: MouseEvent) {
        this.dropdown.show();
        this.image.set_showing();

        event.stopPropagation();
    }

    public hide_dropdown(event: MouseEvent) {
        this.dropdown.hide();
        this.image.set_hiding();

        event.stopPropagation();
    }

    private window_click(event: MouseEvent) {
        if (this.dropdown.is_active() && event.target instanceof Element && !this.target.contains(event.target))
            this.hide_dropdown(event);
    }
}