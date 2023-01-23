use crate::{database::Empty, routes::error::RouteError, state::State, Customer, CustomerNote};
use mysql::{params, serde_json};
use rocket::{response::content::RawJson, serde::json::Json};
use serde::Deserialize;

use super::validate_empty;

const CUSTOMERS_QUERY: &'static str = "SELECT * FROM Customers ORDER BY Name ASC";
const CUSTOMER_QUERY: &'static str = "SELECT * FROM Customers WHERE ID = :id";
const NOTES_QUERY: &'static str =
    "SELECT * FROM Customer_Notes WHERE Customer = :id ORDER BY DateTime DESC";

const UPDATE_QUERY: &'static str =
    "UPDATE Customers SET Name = :name, Email = :email, PhoneNumber = :phone_number WHERE ID = :id";

const CREATE_QUERY: &'static str =
    "INSERT INTO Customers (Name, Email, PhoneNumber) VALUES (:name, :email, :phone_number)";
const CREATE_NOTE_QUERY: &'static str =
    "INSERT INTO Customer_Notes (Customer, Creator, Note) VALUES (:customer, :creator, :note)";

#[get("/customers")]
pub(crate) async fn all(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let customers: Vec<Customer> = state.database().execute_query(CUSTOMERS_QUERY).await?;

    Ok(RawJson(serde_json::to_string(&customers).unwrap()))
}

#[get("/customer?<id>")]
pub(crate) async fn one(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    let customer: Customer = state
        .database()
        .execute_query_parameters(
            CUSTOMER_QUERY,
            params! {
                "id" => id,
            },
        )
        .await?
        .pop()
        .ok_or(RouteError::InputError("Invalid customer id"))?;

    Ok(RawJson(serde_json::to_string(&customer).unwrap()))
}

#[derive(rocket::serde::Deserialize)]
pub struct UpdateInfo {
    name: String,
    phone_number: Option<String>,
    email: Option<String>,
}

#[post("/customers/update/<id>", data = "<info>")]
pub(crate) async fn update(
    id: usize,
    mut info: Json<UpdateInfo>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    if &info.name == "" {
        return Err(RouteError::InputError(
            "Cannot set a customer's name to nothing",
        ));
    }

    validate_empty(&mut info.phone_number);
    validate_empty(&mut info.email);

    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            UPDATE_QUERY,
            params! {
                "id" => id,
                "name" => &info.name,
                "email" => info.email.as_ref(),
                "phone_number" => info.phone_number.as_ref(),
            },
        )
        .await?;

    Ok(String::new())
}

#[post("/customers/create", data = "<info>")]
pub(crate) async fn create(
    mut info: Json<UpdateInfo>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    // Validate input
    if &info.name == "" {
        return Err(RouteError::InputError(
            "Cannot create a customer without a name",
        ));
    }

    validate_empty(&mut info.phone_number);
    validate_empty(&mut info.email);

    // Perform query
    let new_id = state
        .database()
        .execute_query_id(
            CREATE_QUERY,
            params! {
                "name" => &info.name,
                "email" => &info.email,
                "phone_number" => &info.phone_number,
            },
        )
        .await?;

    Ok(format!("{}", new_id))
}

#[get("/customers/notes?<id>")]
pub(crate) async fn notes(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let notes: Vec<CustomerNote> = state
        .database()
        .execute_query_parameters(
            NOTES_QUERY,
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(RawJson(serde_json::to_string(&notes).unwrap()))
}

#[derive(Deserialize)]
pub struct NewNoteInfo {
    customer: usize,
    creator: usize,
    note: String,
}

#[post("/customers/create_note", data = "<info>")]
pub(crate) async fn create_note(
    info: Json<NewNoteInfo>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    if &info.note == "" {
        return Err(RouteError::InputError("Cannot create a note without text"));
    }

    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            CREATE_NOTE_QUERY,
            params! {
                "customer" => info.customer,
                "creator" => info.creator,
                "note" => &info.note,
            },
        )
        .await?;

    Ok(String::new())
}
