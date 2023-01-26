use crate::{
    routes::error::RouteError,
    state::{Empty, State},
};
use mysql::params;
use rocket::{response::content::RawHtml, serde::json::Json};
use serde::Deserialize;
use tera::Context;

#[derive(Deserialize)]
pub struct NewEmployee {
    name: String,
    primary_location: usize,
}

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
            "INSERT INTO Employees (Name, PrimaryLocation) VALUES (:name, :primary_location)",
            params! {
                "name" => &info.name,
                "primary_location" => info.primary_location,
            },
        )
        .await?;

    Ok(format!("{}", id))
}

#[post("/employees/update/<id>", data = "<info>")]
pub(crate) async fn update(
    id: usize,
    info: Json<NewEmployee>,
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
            "UPDATE Employees SET Name = :name, PrimaryLocation = :primary_location WHERE ID = :id",
            params! {
                "id" => id,
                "name" => &info.name,
                "primary_location" => info.primary_location,
            },
        )
        .await?;

    Ok(String::new())
}
