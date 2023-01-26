import { AjaxParser, TableValue, ajax } from "../framework/index";
import { Location } from "./location";

export class Employee implements TableValue {
    private id: number;
    private name: string;
    private active: boolean;
    private primary_location: number;

    public static async get_employees(active: boolean): Promise<Employee[]> {
        return ajax("GET", `/employees/data?active=${active}`, new EmployeesParser());
    }

    public static async get_employee(id: number): Promise<Employee> {
        return ajax("GET", `/employee/data?id=${id}`, new EmployeeParser());
    }

    public constructor(id: number, name: string, active: boolean, primary_location: number) {
        this.id = id;
        this.name = name;
        this.active = active;
        this.primary_location = primary_location;
    }

    public get_id(): number {
        return this.id;
    }

    public get_name(): string {
        return this.name;
    }

    public get_primary_location(): number {
        return this.primary_location;
    }

    public is_active(): boolean {
        return this.active;
    }

    public async render_field(field: string): Promise<string | HTMLElement> {
        switch (field) {
            case "id":
                return this.id.toString();

            case "name":
                return this.name;

            case "active":
                return this.active ? "Active" : "Deactivated";

            case "primary_location":
                return (await Location.get_location(this.primary_location)).get_name();

            default:
                throw `"${field}" is not a valid field for and employee`;
        }
    }

    public filter(field: string, value: any): boolean {
        switch (field) {
            case "id":
                return this.id == value;

            case "name":
                return this.name == value;

            case "active":
                return this.active == value;

            case "primary_location":
                return this.primary_location == value;

            default:
                throw `"${field}" is not a valid field for and employee`;
        }
    }

    public generate_on_click(): string {
        return `/employee?id=${this.id}`;
    }
}

export class NewEmployee {
    private name: string;
    private primary_location: Location;

    public constructor(name: string, primary_location: Location) {
        this.name = name;
        this.primary_location = primary_location;
    }

    public serialize(): any {
        return {
            name: this.name,
            primary_location: this.primary_location,
        };
    }
}

class EmployeesParser implements AjaxParser<Employee[]> {
    public parse_object(object: any): Employee[] {
        let output = [];

        for (let employee of object)
            output.push(new Employee(employee.id, employee.name, employee.active, employee.primary_location));

        return output;
    }
}

class EmployeeParser implements AjaxParser<Employee> {
    public parse_object(employee: any): Employee {
        return new Employee(employee.id, employee.name, employee.active, employee.primary_location);
    }
}