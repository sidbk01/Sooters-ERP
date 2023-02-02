import { CheckboxInput, DateInput, Form, FormBuilder, FormInput, SelectInput, TextInput } from "./framework/index";
import { Employee, Location, OrderType } from "./model/index";

declare const CUSTOMER: number;

class CreateOrderBuilder implements FormBuilder {
    private envelope_id: TextInput;
    private due_date: DateInput;
    private rush: CheckboxInput;
    private employee: SelectInput<Employee>;
    private location: SelectInput<Location>;
    private paid: CheckboxInput;
    private type: SelectInput<OrderType>;

    private constructor() { }

    public static async create(): Promise<CreateOrderBuilder> {
        let builder = new CreateOrderBuilder();

        builder.envelope_id = new TextInput("Envelope ID", 6, undefined, "number");
        builder.due_date = new DateInput("Due Date");
        builder.rush = new CheckboxInput("Rush");
        builder.employee = new SelectInput("Employee", await Employee.get_employees(true));
        builder.location = new SelectInput("Location", await Location.get_locations());
        builder.paid = new CheckboxInput("Paid");
        builder.type = new SelectInput("Type", OrderType.get_order_types());

        return builder;
    }

    public get_inputs(): FormInput[] {
        return [
            this.envelope_id,
            this.due_date,
            this.rush,
            this.employee,
            this.location,
            this.paid,
            this.type,
        ];
    }

    public collect_and_validate(): any {
        let envelope_id = this.envelope_id.validate_and_get();
        let due_date = this.due_date.validate_and_get();
        let rush = this.rush.validate_and_get();
        let employee = this.employee.validate_and_get();
        let location = this.location.validate_and_get();
        let paid = this.paid.validate_and_get();
        let type = this.type.validate_and_get();

        return {
            envelope_id: envelope_id,
            due_date: due_date,
            rush: rush,
            employee: employee,
            customer: CUSTOMER,
            location: location,
            paid: paid,
            type: type,
        };
    }

    public get_post_url(): string {
        return "/orders/create";
    }

    public get_redirect_url(id: number): string {
        return `/order?id=${id}`;
    }

    public get_submit_text(): string {
        return "Create";
    }
}

async function create_form() {
    let builder = await CreateOrderBuilder.create();

    new Form("create-order", builder);
}

create_form().catch((error) => {
    console.error("Error while creating the builder");
    console.error(error);
    alert("There was an error initializing the page");
});
