import { TableBody } from "./body";
import { TableHeader } from "./header";

enum SortStatus {
    None,
    Up,
    Down,
}

export class TableSort {
    private status: SortStatus;
    private element: HTMLImageElement;

    private index?: number;
    private header?: TableHeader;
    private body?: TableBody;

    public constructor() {
        this.status = SortStatus.None;

        this.element = document.createElement("img");
        this.element.src = "/images/no-sort";
        this.element.style.width = "1rem";
        this.element.style.height = "1rem";
        this.element.style.cursor = "pointer";
        this.element.style.marginRight = "0.25rem";
        this.element.onclick = () => { this.on_click(); };
    }

    public get_element(): HTMLImageElement {
        return this.element;
    }

    public set_table(index: number, header: TableHeader, body: TableBody) {
        this.index = index;
        this.header = header;
        this.body = body;
    }

    public reset_sort() {
        this.element.src = "/images/no-sort";
        this.status = SortStatus.None;
    }

    private on_click() {
        if (typeof this.index === "undefined")
            return;


        switch (this.status) {
            case SortStatus.Down:
                this.status = SortStatus.Up;
                this.element.src = "/images/sort-up";
                this.body.sort(this.index, false);
                break;

            case SortStatus.None:
            case SortStatus.Up:
                this.status = SortStatus.Down;
                this.element.src = "/images/sort-down";
                this.header.reset_sorts(this.index);
                this.body.sort(this.index, true);
                break;
        }
    }
}