import { FormInput } from "./input";

export interface FormBuilder {
    get_submit_text(): string;
    get_inputs(): FormInput[];
    get_post_url(): string;

    collect_and_validate(): any;
}