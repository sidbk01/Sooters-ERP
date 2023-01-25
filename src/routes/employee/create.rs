use crate::{routes::error::RouteError, state::State};
use mysql::params;
use rocket::{response::content::RawHtml, serde::json::Json};
use serde::Deserialize;
use tera::Context;

#[derive(Deserialize)]
pub struct NewEmployee {
    name: String,
    primary_location: usize,
}

const CREATE_QUERY: &'static str =
    "INSERT INTO Employees (Name, PrimaryLocation) VALUES (:name, :primary_location)";

#[get("/employees/create")]
pub(super) async fn get_create(
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    state.render("create_employee.html", Context::new())
}

#[post("/employees/create", data = "<info>")]
pub(super) async fn post_create(
    info: Json<NewEmployee>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    // Validate input
    if &info.name == "" {
        return Err(RouteError::InputError(
            "Cannot create an employee without a name",
        ));
    }

    // Perform query
    let id = state
        .database()
        .execute_query_id::<_, _>(
            CREATE_QUERY,
            params! {
                "name" => &info.name,
                "primary_location" => info.primary_location,
            },
        )
        .await?;

    Ok(format!("{}", id))
}
