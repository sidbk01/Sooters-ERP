import { Error, SelectInput, SelectOption, ajax } from "./framework/index";
import { initialize_logger } from "./logging";

enum ReportTypeInner {
    Feedback = 1,
    Bug,
    Error,
}

class ReportType implements SelectOption {
    private type: ReportTypeInner;

    public static get(): ReportType[] {
        return [
            new ReportType(ReportTypeInner.Feedback),
            new ReportType(ReportTypeInner.Bug),
            new ReportType(ReportTypeInner.Error),
        ];
    }

    private constructor(type: ReportTypeInner) {
        this.type = type;
    }

    public get_select_text(): string {
        switch (this.type) {
            case ReportTypeInner.Feedback:
                return "Feedback / Suggestion";

            case ReportTypeInner.Bug:
                return "Bug";

            case ReportTypeInner.Error:
                return "Error";
        }
    }

    public get_select_value(): number {
        return this.type as number;
    }
}

class ReportForm {
    private type: SelectInput<ReportType>;
    private text_label: HTMLDivElement;
    private text_error: Error;
    private text: HTMLTextAreaElement;

    public constructor(target: string) {
        let container = document.getElementById(target);

        this.type = new SelectInput("Type", ReportType.get());
        this.type.get_element().addEventListener('change', () => { this.adjust_label(); });
        container.appendChild(this.type.get_element());

        this.text_label = document.createElement("div");
        this.text_label.style.marginTop = "0.5rem";
        container.appendChild(this.text_label);

        this.text_error = new Error();
        container.appendChild(this.text_error.get_element());

        this.text = document.createElement("textarea");
        container.appendChild(this.text);

        let submit_button = document.createElement("button");
        submit_button.innerText = "Submit Report";
        submit_button.onclick = () => { this.submit(); };
        container.appendChild(submit_button);

        this.adjust_label();
    }

    private adjust_label() {
        if (this.type.validate_and_get() == ReportTypeInner.Feedback)
            this.text_label.innerText = "Please enter your feedback / suggestion";
        else
            this.text_label.innerText = "Please describe the issue";
    }

    private submit() {
        let report = {
            page: decodeURI(document.getElementById("back").innerText)
        };

        // Collect form results
        report["level"] = this.type.validate_and_get();

        if (this.text.value == "") {
            this.text_error.set_message("A message is required!");
            this.text.onkeydown = () => {
                this.text_error.set_message("");
                this.text.onkeydown = () => { };
            };
            return;
        }
        report["message"] = this.text.value;

        // Collect logs
        report["logs"] = sessionStorage.getItem("logs");

        // Collect browser info
        report["user_agent"] = navigator.userAgent;
        report["resolution"] = `${screen.availWidth}x${screen.availHeight}@${screen.colorDepth}`;

        // Submit
        ajax("POST", `/report`, undefined, report).then(() => {
            window.location.href = decodeURI(report.page);
        }).catch((error) => {
            console.error("There was an error submitting the bug report");
            console.error(error);
            alert("An error occurred while submitting the report");
        });
    }
}

initialize_logger();
new ReportForm("report-form");