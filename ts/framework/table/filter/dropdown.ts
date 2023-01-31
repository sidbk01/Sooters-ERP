import { TableBody } from "../body";
import { TableValue } from "../value";
import { FilterOption } from "./option";
import { FilterStatus } from "./status";

export class FilterDropdown {
    private element: HTMLDivElement;
    private active: boolean;

    private statuses: FilterStatus[];

    public constructor(dropdown_title: string, options: FilterOption[], index: number, body: TableBody) {
        this.active = false;

        // Create the container
        this.element = document.createElement("div");
        this.element.classList.add("filter-dropdown");
        this.element.style.display = "none";

        // Create the header
        let title = document.createElement("h4");
        title.innerText = dropdown_title;
        this.element.appendChild(title);

        // Create the statuses
        this.statuses = [];
        for (let option of options) {
            let status = new FilterStatus(option, index, body);

            this.element.append(status.get_element());
            this.statuses.push(status);
        }

        body.update_filter(index);
    }

    public filter_value(value: TableValue, field: string): boolean {
        for (let status of this.statuses)
            if (status.filter_value(value, field))
                return true;

        return false;
    }

    public get_element(): HTMLDivElement {
        return this.element;
    }

    public is_active(): boolean {
        return this.active;
    }

    public show() {
        this.active = true;
        this.element.style.display = "";
    }

    public hide() {
        this.active = false;
        this.element.style.display = "none";
    }
}