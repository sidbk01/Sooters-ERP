import { Table, TableBuilder, TableColumn, ajax } from "./framework/index";
import { Employee } from "./model/index";

declare const ACTIVE: boolean;

class EmployeesBuilder implements TableBuilder<Employee> {
    private employees: Employee[];

    private constructor() { }

    public static async create(): Promise<EmployeesBuilder> {
        let builder = new EmployeesBuilder();

        builder.employees = await Employee.get_employees(ACTIVE);

        return builder;
    }

    public get_columns(): TableColumn[] {
        return [
            new TableColumn("Name", "name"),
            new TableColumn("Primary Location", "primary_location"),
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
    console.log("Error while creating the builder");
    console.log(error);
    alert("There was an error initializing the page");
});
;
