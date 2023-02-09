use crate::{
    routes::RouteError,
    state::{Empty, State},
};
use mysql::{params, serde_json};
use rocket::response::content::{RawHtml, RawJson};
use tera::Context;

use super::Employee;

#[get("/employee?<id>")]
pub(super) async fn view(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("id", &id);

    state.render("employee.html", context)
}

#[get("/employee/data?<id>")]
pub(crate) async fn data(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let employee: Employee = match state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Employees WHERE ID = :id",
            params! {
                "id" => id,
            },
        )
        .await?
        .pop()
    {
        Some(employee) => employee,
        None => return Err(RouteError::InputError("Invalid employee ID")),
    };

    Ok(RawJson(serde_json::to_string(&employee).unwrap()))
}

#[get("/employee/first")]
pub(crate) async fn first(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let employee: Employee = match state
        .database()
        .execute_query("SELECT * FROM Employees WHERE Active = '1' LIMIT 1")
        .await?
        .pop()
    {
        Some(employee) => employee,
        None => return Err(RouteError::InputError("No employees")),
    };

    Ok(RawJson(serde_json::to_string(&employee).unwrap()))
}

#[post("/employees/set_active/<id>/<active>")]
pub(crate) async fn set_active(
    id: usize,
    active: bool,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            "UPDATE Employees SET Active = :active WHERE ID = :id",
            params! {
                "id" => id,
                "active" => if active { 1 } else { 0 }
            },
        )
        .await?;

    Ok(String::new())
}
