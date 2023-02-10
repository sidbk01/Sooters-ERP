import { Employee } from "./model/employee";
import { Location } from "./model/location";

export class Preferences {
    private static instance: Preferences;

    private employee: [number, string];
    private location: [number, string];

    private menu_active: boolean;

    private container: HTMLElement;

    private menu_button: HTMLButtonElement;
    private menu: HTMLDivElement;

    private employee_input?: HTMLSelectElement;
    private location_input?: HTMLSelectElement;

    private employee_value: HTMLDivElement;
    private location_value: HTMLDivElement;

    private edit_button: HTMLButtonElement;
    private confirm_button: HTMLButtonElement;
    private cancel_button: HTMLButtonElement;

    public static get(): Preferences {
        return this.instance;
    }

    public static async create() {
        this.instance = new Preferences();

        await this.instance.load_preferences();

        this.instance.create_menu();
    }

    private constructor() {
        console.debug(`Creating preferences`);
    }

    private create_menu() {
        this.container = document.getElementById("preferences");

        this.menu_button = document.getElementById("preferences-button") as HTMLButtonElement;

        this.menu = document.getElementById("preferences-menu") as HTMLDivElement;

        let header = document.createElement("h4");
        header.innerText = "Preferences";
        this.menu.appendChild(header);

        let employee_container = document.createElement("div");
        employee_container.appendChild(document.createTextNode("Employee: "));

        this.employee_value = document.createElement("div");
        this.employee_value.style.display = "inline";
        this.employee_value.innerText = this.employee[1];
        employee_container.appendChild(this.employee_value);

        employee_container.appendChild(document.createElement("br"));
        this.menu.appendChild(employee_container);

        let location_container = document.createElement("div");
        location_container.appendChild(document.createTextNode("Location: "));

        this.location_value = document.createElement("div");
        this.location_value.style.display = "inline";
        this.location_value.innerText = this.location[1];
        location_container.appendChild(this.location_value);

        location_container.appendChild(document.createElement("br"));
        this.menu.appendChild(location_container);

        let buttons_container = document.createElement("div");

        this.edit_button = document.createElement("button");
        this.edit_button.innerText = "Edit";
        this.edit_button.onclick = () => {
            this.begin_edit().catch((error) => {
                console.error("There was an error while beginning preferences edit");
                console.error(error);
                alert("There was an error while starting preferences edit");
            });
        };
        buttons_container.appendChild(this.edit_button);

        this.confirm_button = document.createElement("button");
        this.confirm_button.innerText = "Confirm";
        this.confirm_button.onclick = () => { this.confirm_edit(); };
        buttons_container.appendChild(this.confirm_button);

        this.cancel_button = document.createElement("button");
        this.cancel_button.innerText = "Cancel";
        this.cancel_button.onclick = () => { this.cancel_edit(); };
        buttons_container.appendChild(this.cancel_button);

        this.menu.appendChild(buttons_container);

        this.hide_menu();
    }

    private async create_inputs() {
        this.employee_input = document.createElement("select");
        let employees = await Employee.get_employees(true);
        for (let employee of employees) {
            let option = document.createElement("option");
            option.innerText = employee.get_select_text();
            option.value = employee.get_select_value().toString();

            if (employee.get_id() == this.employee[0])
                option.selected = true;

            this.employee_input.appendChild(option);
        }

        this.location_input = document.createElement("select");
        let locations = await Location.get_locations();
        for (let location of locations) {
            let option = document.createElement("option");
            option.innerText = location.get_select_text();
            option.value = location.get_select_value().toString();

            if (location.get_select_value() == this.location[0])
                option.selected = true;

            this.location_input.appendChild(option);
        }
    }

    public is_menu_active(): boolean {
        return this.menu_active;
    }

    public get_container(): HTMLElement {
        return this.container;
    }

    public get_employee(): number {
        return this.employee[0];
    }

    public get_location(): number {
        return this.location[0];
    }

    private open_menu(event: Event) {
        this.menu.style.display = "block";
        this.menu_active = true;
        this.menu_button.onclick = (event) => { this.hide_menu(event); };
        event.stopPropagation();
    }

    public hide_menu(event?: Event) {
        this.menu.style.display = "none";
        this.menu_active = false;
        this.menu_button.onclick = (event) => { this.open_menu(event); };
        this.cancel_edit();

        if (typeof event !== "undefined")
            event.stopPropagation();
    }

    private async begin_edit() {
        if (!this.menu_active)
            return;

        if (!this.employee_input)
            await this.create_inputs();

        this.employee_value.innerHTML = "";
        this.employee_value.appendChild(this.employee_input);

        this.location_value.innerHTML = "";
        this.location_value.appendChild(this.location_input);

        this.edit_button.style.display = "none";
        this.confirm_button.style.display = "";
        this.cancel_button.style.display = "";
    }

    private confirm_edit() {
        this.employee[0] = Number(this.employee_input.value);
        this.employee[1] = this.employee_input.options[this.employee_input.selectedIndex].innerText;

        this.location[0] = Number(this.location_input.value);
        this.location[1] = this.location_input.options[this.location_input.selectedIndex].innerText;

        this.write_preferences();

        this.cancel_edit();
    }

    private cancel_edit() {
        this.employee_value.innerHTML = "";
        this.employee_value.innerText = this.employee[1];

        this.location_value.innerHTML = "";
        this.location_value.innerText = this.location[1];

        this.edit_button.style.display = "";
        this.confirm_button.style.display = "none";
        this.cancel_button.style.display = "none";
    }

    private async load_preferences() {
        let employee_name = localStorage.getItem("preferred_employee_name");
        if (!employee_name)
            return this.load_preferences_from_cookie();

        let employee_id = Number(localStorage.getItem("preferred_employee_id"));
        let location_name = localStorage.getItem("preferred_location_name");
        let location_id = Number(localStorage.getItem("preferred_location_id"));

        if (employee_id == 0 || location_id == 0)
            this.load_default_preferences();

        this.employee = [employee_id, employee_name];
        this.location = [location_id, location_name];
    }

    private async load_preferences_from_cookie() {
        let cookies = document.cookie;

        let employee_id = undefined;
        let location_id = undefined;

        for (let cookie of cookies.split(';')) {
            let split = cookie.split("=");

            let title = split[0].trim();

            if (title != "preferred_employee" && title != "preferred_location")
                continue;

            let content = "";
            for (let i = 1; i < split.length; i++) {
                content += split[i];
                if (i != split.length - 1)
                    content += '=';
            }

            if (title == "preferred_employee")
                employee_id = Number(content.trim());
            else
                location_id = Number(content.trim());
        }

        if (typeof employee_id == "undefined" || typeof location_id == "undefined" || employee_id == 0 || location_id == 0)
            return this.load_default_preferences();

        let employee_name = (await Employee.get_employee(employee_id)).get_name();
        let location_name = (await Location.get_location(location_id)).get_name();

        this.employee = [employee_id, employee_name];
        this.location = [location_id, location_name];

        this.write_preferences();
    }

    private async load_default_preferences() {
        let default_location = (await Location.get_locations()).pop();
        let default_employee = (await Employee.get_first());

        this.location = [default_location.get_select_value(), default_location.get_name()];
        this.employee = [default_employee.get_id(), default_employee.get_name()];

        this.write_preferences();
    }

    private write_preferences() {
        localStorage.setItem("preferred_employee_name", this.employee[1]);
        localStorage.setItem("preferred_employee_id", this.employee[0].toString());
        localStorage.setItem("preferred_location_name", this.location[1]);
        localStorage.setItem("preferred_location_id", this.location[0].toString());
    }
}

window.addEventListener('click', (event) => {
    if (event.target instanceof Element && Preferences.get().is_menu_active() && !Preferences.get().get_container().contains(event.target))
        Preferences.get().hide_menu();
});

Preferences.create().catch((error) => {
    console.error("Error while creating preferences");
    console.error(error);

    alert("There was an error while initializing preferences");
})