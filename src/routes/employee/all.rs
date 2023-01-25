use super::Employee;
use crate::{routes::RouteError, state::State};
use mysql::{params, serde_json};
use rocket::response::content::{RawHtml, RawJson};
use tera::Context;

#[get("/employees?<active>")]
pub(super) async fn view(
    active: Option<bool>,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("active", &active.unwrap_or(true));

    state.render("employees.html", context)
}

#[get("/employees/data?<active>")]
pub(crate) async fn data(
    active: Option<bool>,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Resolve the optional parameter
    let active = active.unwrap_or(true);

    // Perform the query
    let employees: Vec<Employee> = state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Employees WHERE Active = :active",
            params! {
                "active" => if active { 1 } else { 0 }
            },
        )
        .await?;

    Ok(RawJson(serde_json::to_string(&employees).unwrap()))
}
