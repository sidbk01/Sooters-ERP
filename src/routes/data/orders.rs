use crate::{routes::error::RouteError, state::State, Order, OrderType};
use mysql::{params, serde_json};
use rocket::{response::content::RawJson, serde::json::Json};
use serde::{
    de::{Error, Expected, Visitor},
    Deserialize,
};

const ORDERS_QUERY: &'static str = "SELECT * FROM Orders WHERE ID = :id ORDER BY DateReceived ASC";
const ORDER_TYPES_QUERY: &'static str = "SELECT * FROM Order_Types ORDER BY Name ASC";

const CREATE_QUERY: &'static str = "INSERT INTO Orders (EnvelopeID, CurrentLocation, SourceLocation, Receiver, OrderType, Customer, DateDue, Rush) VALUES (:envelope_id, :location, :location, :employee, :order_type, :customer, :due_date, :rush);";
const CREATE_FILM_QUERY: &'static str = "INSERT INTO Film_Orders (ID, Prints, Digital, NumberOfRolls, Color) VALUES (LAST_INSERT_ID(), :prints, :digital, :num_rolls, :color);";

#[get("/orders?<customer>")]
pub(crate) async fn all(
    customer: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let orders: Vec<Order> = state
        .database()
        .execute_query_parameters(
            ORDERS_QUERY,
            params! {
                "id" => customer,
            },
        )
        .await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}

#[get("/order_types")]
pub(crate) async fn types(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let orders: Vec<OrderType> = state.database().execute_query(ORDER_TYPES_QUERY).await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}

pub struct CreateInfo {
    envelope_id: Option<usize>,
    due_date: String,
    rush: bool,
    employee: usize,
    location: usize,
    order_type: usize,
    type_info: OrderTypeInfo,
}

struct CreateVisitor;
struct CustomExpected(&'static str);

enum OrderTypeInfo {
    Film(FilmInfo),
}

struct FilmInfo {
    prints: bool,
    digital: bool,
    color: bool,
    num_rolls: usize,
}

#[post("/orders/create?<customer>", data = "<info>")]
pub(crate) async fn create(
    customer: usize,
    info: Json<CreateInfo>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    let queries = vec![
        (
            CREATE_QUERY,
            params! {
                "envelope_id" => &info.envelope_id,
                "location" => &info.location,
                "employee" => &info.employee,
                "order_type" => &info.order_type,
                "customer" => &customer,
                "due_date" => &info.due_date,
                "rush" => &info.rush,
            },
        ),
        info.type_info.create_query(),
    ];

    // Perform query
    state.database().execute_transaction(queries).await?;

    Ok(String::new())
}

impl<'de> Deserialize<'de> for CreateInfo {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_map(CreateVisitor)
    }
}

impl<'de> Visitor<'de> for CreateVisitor {
    type Value = CreateInfo;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "create order information")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut envelope_id = None;
        let mut due_date = None;
        let mut rush = None;
        let mut employee = None;
        let mut location = None;
        let mut order_type = None;
        let mut type_info = None;

        while let Some((key, value)) = map.next_entry::<&'de str, serde_json::Value>()? {
            match key {
                "envelope_id" => match value.as_u64() {
                    Some(value) => envelope_id = Some(value as usize),
                    None => return Err(A::Error::custom("Expected a number for envelope id")),
                },
                "due_date" => match value.as_str() {
                    Some(value) => due_date = Some(value.to_owned()),
                    None => return Err(A::Error::custom("Expected a string for the due date")),
                },
                "rush" => match value.as_bool() {
                    Some(value) => rush = Some(value),
                    None => return Err(A::Error::custom("Expected a boolean for rush")),
                },
                "employee" => match value.as_u64() {
                    Some(value) => employee = Some(value as usize),
                    None => return Err(A::Error::custom("Expected a number for employee")),
                },
                "location" => match value.as_u64() {
                    Some(value) => location = Some(value as usize),
                    None => return Err(A::Error::custom("Expected a number for location")),
                },
                "order_type" => match value.as_array() {
                    Some(value) => {
                        if value.len() != 2 {
                            return Err(A::Error::custom("Order type must contain two elements"));
                        }

                        let order_info = match value[1].as_object() {
                            Some(order_info) => order_info,
                            None => {
                                return Err(A::Error::custom(
                                    "Expected an object for order type info",
                                ));
                            }
                        };
                        match value[0].as_u64() {
                            Some(value) => match value {
                                1 => {
                                    order_type = Some(1);
                                    type_info =
                                        Some(OrderTypeInfo::Film(FilmInfo::parse(order_info)?));
                                }
                                _ => return Err(A::Error::custom("Unknown order type")),
                            },
                            None => {
                                return Err(A::Error::custom("Expected a number for order type id"))
                            }
                        }
                    }
                    None => return Err(A::Error::custom("Expected an array for order type")),
                },
                _ => continue,
            }
        }

        Ok(CreateInfo {
            envelope_id,
            due_date: due_date.ok_or(A::Error::missing_field("due_date"))?,
            rush: rush.ok_or(A::Error::missing_field("rush"))?,
            employee: employee.ok_or(A::Error::missing_field("employee"))?,
            location: location.ok_or(A::Error::missing_field("location"))?,
            order_type: order_type.ok_or(A::Error::missing_field("order_type"))?,
            type_info: type_info.ok_or(A::Error::missing_field("order_type"))?,
        })
    }
}

impl Expected for CustomExpected {
    fn fmt(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "{}", self.0)
    }
}

impl OrderTypeInfo {
    pub fn create_query(&self) -> (&'static str, mysql::Params) {
        match self {
            OrderTypeInfo::Film(film) => film.create_query(),
        }
    }
}

impl FilmInfo {
    pub fn create_query(&self) -> (&'static str, mysql::Params) {
        (
            CREATE_FILM_QUERY,
            params! {
                "prints" => &self.prints,
                "digital" => &self.digital,
                "color"=> &self.color,
                "num_rolls" => &self.num_rolls,
            },
        )
    }

    pub fn parse<E: serde::de::Error>(
        map: &serde_json::Map<String, serde_json::Value>,
    ) -> Result<Self, E> {
        let prints = match map.get("prints") {
            Some(prints) => match prints.as_bool() {
                Some(prints) => prints,
                None => return Err(E::custom("Expected a boolean for prints")),
            },
            None => return Err(E::missing_field("prints")),
        };
        let digital = match map.get("digital") {
            Some(digital) => match digital.as_bool() {
                Some(digital) => digital,
                None => return Err(E::custom("Expected a boolean for digital")),
            },
            None => return Err(E::missing_field("digital")),
        };
        let color = match map.get("color") {
            Some(color) => match color.as_bool() {
                Some(color) => color,
                None => return Err(E::custom("Expected a boolean for color")),
            },
            None => return Err(E::missing_field("color")),
        };
        let num_rolls = match map.get("num_rolls") {
            Some(num_rolls) => match num_rolls.as_u64() {
                Some(num_rolls) => num_rolls as usize,
                None => {
                    return Err(E::custom(
                        "Expected an unsigned integer for number of rolls",
                    ))
                }
            },
            None => return Err(E::missing_field("num_rolls")),
        };

        if num_rolls < 1 {
            return Err(E::custom("Number of rolls must be at least 1"));
        }

        Ok(FilmInfo {
            prints,
            digital,
            color,
            num_rolls,
        })
    }
}