use crate::{database::Empty, routes::error::RouteError, state::State, Employee};
use mysql::{params, serde_json};
use rocket::{response::content::RawJson, serde::json::Json};

const EMPLOYEES_QUERY: &'static str =
    "SELECT * FROM Employees WHERE Active = :active ORDER BY Name ASC";
const EMPLOYEE_QUERY: &'static str = "SELECT * FROM Employees WHERE ID = :id";

const SET_ACTIVE_QUERY: &'static str = "UPDATE Employees SET Active = :active WHERE ID = :id";
const UPDATE_QUERY: &'static str =
    "UPDATE Employees SET Name = :name, PrimaryLocation = :primary_location WHERE ID = :id";

#[get("/employees?<active>")]
pub(crate) async fn all(
    active: Option<bool>,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Resolve the optional parameter
    let active = active.unwrap_or(true);

    // Perform the query
    let employees: Vec<Employee> = state
        .database()
        .execute_query_parameters(
            EMPLOYEES_QUERY,
            params! {
                "active" => if active { 1 } else { 0 }
            },
        )
        .await?;

    Ok(RawJson(serde_json::to_string(&employees).unwrap()))
}

#[get("/employee?<id>")]
pub(crate) async fn one(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    let employee: Employee = state
        .database()
        .execute_query_parameters(
            EMPLOYEE_QUERY,
            params! {
                "id" => id,
            },
        )
        .await?
        .pop()
        .unwrap();

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
            SET_ACTIVE_QUERY,
            params! {
                "id" => id,
                "active" => if active { 1 } else { 0 }
            },
        )
        .await?;

    Ok(String::new())
}

#[derive(rocket::serde::Deserialize)]
pub struct UpdateInfo {
    name: String,
    primary_location: usize,
}

#[post("/employees/update/<id>", data = "<info>")]
pub(crate) async fn update(
    id: usize,
    info: Json<UpdateInfo>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    if &info.name == "" {
        return Err(RouteError::InputError(
            "Cannot set an employee's name to nothing",
        ));
    }

    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            UPDATE_QUERY,
            params! {
                "id" => id,
                "name" => &info.name,
                "primary_location" => info.primary_location,
            },
        )
        .await?;

    Ok(String::new())
}
