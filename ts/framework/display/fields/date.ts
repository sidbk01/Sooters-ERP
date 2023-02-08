import { Error } from "../../error";
import { DisplayFieldInput } from "../input";

const MONTHS: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

function format_date(date: Date): string {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function format_date_time(date_time: Date): string {
    let hour = date_time.getHours();
    let m = "AM";
    if (hour == 0)
        hour = 12;
    else if (hour == 12)
        m = "PM";
    else if (hour > 12) {
        hour -= 12;
        m = "PM";
    }

    return `${hour}:${("0" + date_time.getMinutes()).slice(0, 2)} ${m} ${format_date(date_time)}`;
}

export class DateDisplayField implements DisplayFieldInput {
    private container: HTMLDivElement;
    private input_container: HTMLDivElement;
    private input: HTMLInputElement;
    private error: Error;
    private value_element: HTMLDivElement;

    private value: string;
    private time: boolean;
    private required_message: string;

    public constructor(initial_value: string, required_message?: string, time = false) {
        console.debug(`Creating DateDisplayField`);
        this.time = time;

        this.value = initial_value;
        this.required_message = required_message;

        this.container = document.createElement("div");

        this.input_container = document.createElement("div");
        this.input_container.style.display = "none";

        this.input = document.createElement("input");
        this.input.type = time ? "datetime-local" : "date";
        this.input_container.appendChild(this.input);

        this.error = new Error();
        this.input_container.appendChild(this.error.get_element());

        this.container.appendChild(this.input_container);

        this.value_element = document.createElement("div");
        this.value_element.innerText = initial_value;
        this.container.appendChild(this.value_element);
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public begin_edit() {
        this.value_element.style.display = "none";
        this.input_container.style.display = "";

        if (this.time) {
            let date = new Date(this.value);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            this.input.value = date.toISOString().slice(0, 16);
        } else
            this.input.valueAsDate = new Date(this.value);
        this.error.set_message("");
    }

    public get_value_and_validate(): string {
        let value = this.input.value;

        try {
            if (this.required_message && value == "")
                throw this.required_message;
        } catch (e) {
            this.error.set_message(e);
            this.input.onkeydown = () => {
                this.error.set_message("");
                this.input.onkeydown = () => { }
            };

            throw e;
        }

        return value == "" ? undefined : value;
    }

    public confirm_edit() {
        if (this.time)
            this.value = format_date_time(new Date(this.input.value));
        else
            this.value = format_date(new Date(this.input.value.replace(/-/g, '/')));
        this.value_element.innerText = this.value;
    }

    public cancel_edit() {
        this.value_element.style.display = "";
        this.input_container.style.display = "none";
    }
}
