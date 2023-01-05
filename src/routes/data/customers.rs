use crate::{database::Empty, routes::error::RouteError, state::State, Customer};
use mysql::{params, serde_json};
use rocket::{response::content::RawJson, serde::json::Json};

use super::validate_empty;

const CUSTOMERS_QUERY: &'static str = "SELECT * FROM Customers ORDER BY Name ASC";
const CUSTOMER_QUERY: &'static str = "SELECT * FROM Customers WHERE ID = :id";

const UPDATE_QUERY: &'static str =
    "UPDATE Customers SET Name = :name, Email = :email, PhoneNumber = :phone_number WHERE ID = :id";

const CREATE_QUERY: &'static str =
    "INSERT INTO Customers (Name, Email, PhoneNumber) VALUES (:name, :email, :phone_number)";

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
        .unwrap();

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
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            CREATE_QUERY,
            params! {
                "name" => &info.name,
                "email" => &info.email,
                "phone_number" => &info.phone_number
            },
        )
        .await?;

    Ok(String::new())
}
