import { Display, DisplayBuilder, DisplayField, SelectDisplayField, ajax } from "./framework/index";
import { Employee, Location } from "./model/index";

declare const ID: number;

class EmployeeBuilder implements DisplayBuilder {
    private employee: Employee;

    private fields: DisplayField[];

    private constructor() { }

    public static async create(): Promise<EmployeeBuilder> {
        let builder = new EmployeeBuilder();

        builder.employee = await Employee.get_employee(ID);
        builder.fields = [
            new DisplayField("primary_location", "Primary Location", new SelectDisplayField(await Location.get_locations(), builder.employee.get_primary_location()))
        ];

        let button_div = document.getElementById("activate-button");
        let activate_button = document.createElement("button");
        activate_button.innerText = builder.employee.is_active() ? "Deactivate" : "Activate";
        activate_button.onclick = () => { builder.change_active(); };
        button_div.appendChild(activate_button);

        return builder;
    }

    public get_title(): string {
        return this.employee.get_name();
    }

    public get_fields(): DisplayField[] {
        return this.fields;
    }

    public get_title_max_length(): number {
        return 64;
    }

    public get_title_field_name(): string {
        return "name";
    }

    public is_title_editable(): boolean {
        return true;
    }

    public post_update(object: any): Promise<undefined> {
        return ajax("POST", `/employees/update/${ID}`, undefined, object);
    }

    private change_active() {
        let path = `/employees/set_active/${this.employee.get_id()}/${!this.employee.is_active()}`;

        ajax("POST", path).then((_) => {
            window.location.reload();
        }).catch((error) => {
            console.error("Error changing the active status");
            console.error(error);
            alert(`There was an error while ${this.employee.is_active() ? "deactivating" : "activating"} the employee`);
        });

    }
}

async function create_display() {
    let builder = await EmployeeBuilder.create();

    await Display.create("employee", builder);
}

create_display().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});
