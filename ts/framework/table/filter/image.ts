import { Filter } from "./filter";

export class FilterImage {
    private element: HTMLImageElement;

    private parent: Filter;

    public constructor(parent: Filter) {
        this.parent = parent;

        this.element = document.createElement("img");
        this.element.classList.add("filter");
        this.element.src = "/images/filter";

        this.set_hiding();
    }

    public get_element(): HTMLImageElement {
        return this.element;
    }

    public set_showing() {
        this.element.onclick = (event) => { this.parent.hide_dropdown(event); };
    }

    public set_hiding() {
        this.element.onclick = (event) => { this.parent.show_dropdown(event); };
    }
}