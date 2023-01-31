use crate::{routes::error::RouteError, state::State};
use mysql::params;
use rocket::{response::content::RawHtml, serde::json::Json};
use serde::Deserialize;
use tera::Context;

#[derive(Deserialize)]
pub struct NewCustomer {
    first_name: String,
    last_name: String,
    email: Option<String>,
    phone_number: Option<String>,
}

#[get("/customers/create")]
pub(super) async fn get_create(
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    state.render("create_customer.html", Context::new())
}

#[post("/customers/create", data = "<info>")]
pub(super) async fn post_create(
    mut info: Json<NewCustomer>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    // Validate input
    if &info.first_name == "" {
        return Err(RouteError::InputError(
            "Cannot create a customer without a first name",
        ));
    }

    if &info.last_name == "" {
        return Err(RouteError::InputError(
            "Cannot create a customer without a last name",
        ));
    }

    match &info.email {
        Some(email) => match email == "" {
            true => info.email = None,
            false => {}
        },
        None => {}
    }

    match &info.phone_number {
        Some(phone_number) => match phone_number == "" {
            true => info.phone_number = None,
            false => {}
        },
        None => {}
    }

    // Perform query
    let id = state
        .database()
        .execute_query_id::<_, _>(
            "INSERT INTO Customers (FirstName, LastName, Email, PhoneNumber) VALUES (:first_name, :last_name, :email, :phone_number)",
            params! {
                "first_name" => &info.first_name,
                "last_name" => &info.last_name,
                "email" => &info.email,
                "phone_number" => &info.phone_number,
            },
        )
        .await?;

    Ok(format!("{}", id))
}
