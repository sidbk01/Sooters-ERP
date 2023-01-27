import { Table, TableBuilder, TableColumn } from "./framework/index";
import { Employee, Location } from "./model/index";

declare const ACTIVE: boolean;

class EmployeesBuilder implements TableBuilder<Employee> {
    private employees: Employee[];

    private constructor() {
        console.debug("Creating EmployeesBuilder");
    }

    public static async create(): Promise<EmployeesBuilder> {
        let builder = new EmployeesBuilder();

        builder.employees = await Employee.get_employees(ACTIVE);

        return builder;
    }

    public async get_columns(): Promise<TableColumn[]> {
        return [
            new TableColumn("Name", "name"),
            new TableColumn("Primary Location", "primary_location", undefined, [await Location.get_location_filter_options(), "Select Location"]),
        ];
    }

    public get_values(): any[] {
        return this.employees;
    }
}

async function create_table() {
    let builder = await EmployeesBuilder.create();

    await Table.create("employees", builder);
}

create_table().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});
;
