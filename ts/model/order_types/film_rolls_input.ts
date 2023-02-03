import { Error, FormInput } from "../../framework/index";
import { FilmTypeOption } from "./film_roll";

class FilmRollInput {
    private container: HTMLDivElement;
    private amount: HTMLInputElement;
    private type: HTMLSelectElement;
    private exposures: HTMLInputElement;
    private error: Error;

    private parent: FilmRollsInput;

    public constructor(parent?: FilmRollsInput) {
        this.container = document.createElement("div");
        this.parent = parent;

        this.amount = document.createElement("input");
        this.amount.type = "number";
        this.amount.max = "99";
        this.amount.style.width = "4rem";
        this.amount.value = "1";
        this.container.appendChild(this.amount);

        this.type = document.createElement("select");
        this.type.style.width = "10rem";
        this.type.style.marginLeft = "0.25rem";
        this.type.style.marginRight = this.type.style.marginLeft;
        for (let type of FilmTypeOption.get()) {
            let option = document.createElement("option");
            option.innerText = type.get_select_text();
            option.value = type.get_select_value().toString();
            this.type.appendChild(option);
        }
        this.container.appendChild(this.type);

        this.exposures = document.createElement("input");
        this.exposures.type = "number";
        this.exposures.max = "99";
        this.exposures.style.width = "4rem";
        this.exposures.value = "24";
        this.container.appendChild(this.exposures);

        this.error = new Error();

        if (!parent) {
            let empty = document.createElement("div");
            empty.style.display = "inline-block";
            empty.style.width = "4rem";
            empty.style.marginLeft = "0.25rem";
            this.container.appendChild(empty);
            this.container.appendChild(this.error.get_element());
            return;
        }

        let remove_button = document.createElement("button");
        remove_button.type = "button";
        remove_button.innerText = "Delete";
        remove_button.style.display = "inline-block";
        remove_button.style.width = "4rem";
        remove_button.style.marginLeft = "0.25rem";
        remove_button.onclick = () => { this.remove(); };
        this.container.appendChild(remove_button);

        this.container.appendChild(this.error.get_element());
    }

    public get_element(): HTMLDivElement {
        return this.container;
    }

    public validate_and_get(): any {
        let amount = Number(this.amount.value);
        if (amount < 1) {
            this.error.set_message("All amounts must be more than 1");
            this.amount.onkeydown = () => {
                this.error.set_message("");
                this.amount.onkeydown = () => { };
            };
            throw "All amounts must be more than 1";
        }

        let exposures = Number(this.exposures.value);
        if (exposures < 1) {
            this.error.set_message("All exposures must be more than 1");
            this.exposures.onkeydown = () => {
                this.error.set_message("");
                this.exposures.onkeydown = () => { };
            };
            throw "All exposures must be more than 1";
        }

        let type = Number(this.type.value);

        return {
            amount: amount,
            film_type: type,
            exposures: exposures,
        }
    }

    private remove() {
        this.container.remove();
        this.parent.remove_roll(this);
    }
}

export class FilmRollsInput implements FormInput {
    private container: HTMLDivElement;
    private inputs_container: HTMLDivElement;
    private inputs: FilmRollInput[];

    public constructor() {
        this.container = document.createElement("div");

        let header = document.createElement("div");
        header.innerText = "Rolls";
        this.container.appendChild(header);

        let header_container = document.createElement("div");

        let amount_header = document.createElement("div");
        amount_header.innerText = "Amount";
        amount_header.style.display = "inline-block";
        amount_header.style.width = "4rem";
        header_container.appendChild(amount_header);

        let type_header = document.createElement("div");
        type_header.innerText = "Type";
        type_header.style.display = "inline-block";
        type_header.style.width = "10rem";
        type_header.style.marginLeft = "0.25rem";
        type_header.style.marginRight = type_header.style.marginLeft;
        header_container.appendChild(type_header);

        let exposures_header = document.createElement("div");
        exposures_header.innerText = "Exposures";
        exposures_header.style.display = "inline-block";
        exposures_header.style.width = "4rem";
        header_container.appendChild(exposures_header);

        let empty = document.createElement("div");
        empty.style.display = "inline-block";
        empty.style.width = "4rem";
        empty.style.marginLeft = "0.25rem";
        header_container.appendChild(empty);

        this.container.appendChild(header_container);

        this.inputs = [];
        this.inputs_container = document.createElement("div");
        this.container.appendChild(this.inputs_container);

        let add_button = document.createElement("button");
        add_button.type = "button";
        add_button.innerText = "Add";
        add_button.style.marginBottom = "1.5rem";
        add_button.onclick = () => { this.add_roll(); };
        this.container.appendChild(add_button);

        this.add_roll(true);
    }

    public get_element(): HTMLElement {
        return this.container;
    }

    public get_name(): string {
        return "Rolls";
    }

    public validate_and_get(): any {
        return this.inputs.map((roll) => { return roll.validate_and_get(); });
    }

    public remove_roll(roll: FilmRollInput) {
        let index = this.inputs.indexOf(roll);
        if (index > -1)
            this.inputs.splice(index, 1);
    }

    private add_roll(first = false) {
        let new_roll = new FilmRollInput(first ? undefined : this);
        this.inputs_container.appendChild(new_roll.get_element());
        this.inputs.push(new_roll);
    }
}