import { FilterOption } from "./filter_option";

export class Filter {
    private image: HTMLImageElement;
    private dropdown: HTMLDivElement;

    private dropdown_active: boolean;
    private filter_options: [FilterOption, boolean, HTMLInputElement][];

    private target: HTMLTableCellElement;

    public constructor(filter_options: FilterOption[], title: string) {
        this.dropdown_active = false;

        this.image = document.createElement("img");
        this.image.classList.add("filter");
        this.image.src = "/images/filter";
        this.image.onclick = (event) => { this.show_filter_window(event); };

        this.dropdown = document.createElement("div");
        this.dropdown.classList.add("filter-dropdown");
        this.dropdown.style.display = "none";

        let title_element = document.createElement("h4");
        title_element.innerText = title;
        this.dropdown.appendChild(title_element);

        this.filter_options = [];
        for (let i = 0; i < filter_options.length; i++) {
            let option_element = document.createElement("div");

            let option_label = document.createElement("label");
            option_label.innerText = filter_options[i].get_display();
            option_element.appendChild(option_label);

            let option_input = document.createElement("input");
            option_input.type = "checkbox";
            option_input.style.marginLeft = "0.25rem";
            option_input.checked = true;
            option_input.onchange = () => { this.update_filter(i); };
            option_element.appendChild(option_input);

            this.dropdown.append(option_element);

            this.filter_options.push([filter_options[i], true, option_input]);
        }

        window.addEventListener("click", (event) => { this.window_click(event); });
    }

    public get_image_element(): HTMLImageElement {
        return this.image;
    }

    public get_dropdown_element(): HTMLDivElement {
        return this.dropdown;
    }

    public set_target(target: HTMLTableCellElement) {
        this.target = target;
    }

    private show_filter_window(event: MouseEvent) {
        this.dropdown_active = true;
        this.dropdown.style.display = "";

        this.image.onclick = (event) => { this.hide_filter_window(event); };

        event.stopPropagation();
    }

    private hide_filter_window(event: MouseEvent) {
        this.dropdown_active = false;
        this.dropdown.style.display = "none";

        this.image.onclick = (event) => { this.show_filter_window(event); };

        event.stopPropagation();
    }

    private window_click(event: MouseEvent) {
        if (this.dropdown_active && this.target && event.target instanceof Element && !this.target.contains(event.target))
            this.hide_filter_window(event);
    }

    private update_filter(idx: number) { }
}