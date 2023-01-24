use crate::{
    database::Empty, routes::error::RouteError, state::State, Order, OrderNote, OrderType,
};
use mysql::{params, serde_json};
use rocket::{response::content::RawJson, serde::json::Json};
use serde::{
    de::{Error, Expected, Visitor},
    Deserialize,
};

enum OrderTypeInfo {
    Film(FilmInfo),
    Framing(FramingInfo),
    Photoshoot(PhotoshootInfo),
}

pub struct CreateInfo {
    envelope_id: Option<usize>,
    due_date: String,
    rush: bool,
    employee: usize,
    location: usize,
    paid: bool,
    order_type: usize,
    type_info: OrderTypeInfo,
}

struct CreateVisitor;
struct CustomExpected(&'static str);

struct FilmInfo {
    prints: usize,
    digital: bool,
    color: bool,
    num_rolls: usize,
    exposures: usize,
}

struct FramingInfo {
    category: String,
    width: usize,
    height: usize,
}

struct PhotoshootInfo {
    date_time: String,
    photoshoot_type: usize,
}

const ORDERS_QUERY: &'static str =
    "SELECT * FROM Orders WHERE Customer = :id ORDER BY DateReceived DESC, FormattedID DESC";
const ORDER_TYPES_QUERY: &'static str = "SELECT * FROM Order_Types ORDER BY Name ASC";
const ORDER_QUERY: &'static str = "SELECT * FROM Orders WHERE ID = :id";
const NOTES_QUERY: &'static str =
    "SELECT * FROM Order_Notes WHERE OrderID = :id ORDER BY DateTime DESC";
const UPCOMING_ORDERS_QUERY: &'static str = "SELECT * FROM Orders WHERE DateComplete IS NULL AND DateDue BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) ORDER BY DateDue ASC, FormattedID DESC";
const RECENT_ORDERS_QUERY: &'static str = "SELECT * FROM Orders WHERE DateReceived BETWEEN DATE_SUB(NOW(), INTERVAL 2 DAY) AND NOW() ORDER BY DateReceived DESC, FormattedID DESC";

const PAID_QUERY: &'static str = "UPDATE Orders SET Paid = '1' WHERE ID = :id";
const COMPLETED_QUERY: &'static str = "UPDATE Orders SET DateComplete = CURDATE() WHERE ID = :id";
const PICKED_UP_QUERY: &'static str = "UPDATE Orders SET PickedUp = '1' WHERE ID = :id";
const CHANGE_LOCATION_QUERY: &'static str =
    "UPDATE Orders SET CurrentLocation = :location WHERE ID = :id";

const CREATE_QUERY: &'static str = "INSERT INTO Orders (EnvelopeID, CurrentLocation, SourceLocation, Receiver, OrderType, Customer, DateDue, Paid, Rush) VALUES (:envelope_id, :location, :location, :employee, :order_type, :customer, :due_date, :paid, :rush);";
const CREATE_FILM_QUERY: &'static str = "INSERT INTO Film_Orders (ID, Prints, Digital, NumberOfRolls, Color, Exposures) VALUES (LAST_INSERT_ID(), :prints, :digital, :num_rolls, :color, :exposures);";
const CREATE_FRAMING_QUERY: &'static str = "INSERT INTO Framing_Orders (ID, Category, Width, Height) VALUES (LAST_INSERT_ID(), :category, :width, :height)";
const CREATE_PHOTOSHOOT_QUERY: &'static str =
    "INSERT INTO Photoshoots (ID, DateTime, Type) VALUES (LAST_INSERT_ID(), :date_time, :type)";
const CREATE_NOTE_QUERY: &'static str =
    "INSERT INTO Order_Notes (OrderID, Creator, Note) VALUES (:order, :creator, :note)";

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

#[get("/order/notes?<id>")]
pub(crate) async fn notes(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let notes: Vec<OrderNote> = state
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
    order: usize,
    creator: usize,
    note: String,
}

#[post("/order/create_note", data = "<info>")]
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
                "order" => info.order,
                "creator" => info.creator,
                "note" => &info.note,
            },
        )
        .await?;

    Ok(String::new())
}

#[get("/order?<id>")]
pub(crate) async fn one(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    let order: Order = state
        .database()
        .execute_query_parameters(
            ORDER_QUERY,
            params! {
                "id" => id,
            },
        )
        .await?
        .pop()
        .ok_or(RouteError::InputError("Invalid order ID"))?;

    Ok(RawJson(serde_json::to_string(&order).unwrap()))
}

#[get("/orders/upcoming")]
pub(crate) async fn upcoming(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    let orders: Vec<Order> = state
        .database()
        .execute_query(UPCOMING_ORDERS_QUERY)
        .await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}

#[get("/orders/recent")]
pub(crate) async fn recent(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    let orders: Vec<Order> = state.database().execute_query(RECENT_ORDERS_QUERY).await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}

#[post("/order/paid?<id>")]
pub(crate) async fn paid(id: usize, state: &rocket::State<State>) -> Result<String, RouteError> {
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            PAID_QUERY,
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(String::new())
}

#[post("/order/completed?<id>")]
pub(crate) async fn completed(
    id: usize,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            COMPLETED_QUERY,
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(String::new())
}

#[post("/order/picked_up?<id>")]
pub(crate) async fn picked_up(
    id: usize,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            PICKED_UP_QUERY,
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(String::new())
}

#[post("/order/change_location?<id>&<location>")]
pub(crate) async fn change_location(
    id: usize,
    location: usize,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            CHANGE_LOCATION_QUERY,
            params! {
                "id" => id,
                "location" => location,
            },
        )
        .await?;

    Ok(String::new())
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
                "paid" => &info.paid,
                "rush" => &info.rush,
            },
        ),
        info.type_info.create_query(),
    ];

    // Perform query
    let id = state.database().execute_transaction_id(queries).await?;

    Ok(format!("{}", id))
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
        let mut paid = None;

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
                "paid" => match value.as_bool() {
                    Some(value) => paid = Some(value),
                    None => return Err(A::Error::custom("Expected a boolean for paid")),
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
                                2 => {
                                    order_type = Some(2);
                                    type_info = Some(OrderTypeInfo::Framing(FramingInfo::parse(
                                        order_info,
                                    )?));
                                }
                                3 => {
                                    order_type = Some(3);
                                    type_info = Some(OrderTypeInfo::Photoshoot(
                                        PhotoshootInfo::parse(order_info)?,
                                    ));
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
            paid: paid.ok_or(A::Error::missing_field("paid"))?,
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
            OrderTypeInfo::Framing(framing) => framing.create_query(),
            OrderTypeInfo::Photoshoot(photoshoot) => photoshoot.create_query(),
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
                "exposures" => &self.exposures,
            },
        )
    }

    pub fn parse<E: serde::de::Error>(
        map: &serde_json::Map<String, serde_json::Value>,
    ) -> Result<Self, E> {
        let prints = match map.get("prints") {
            Some(prints) => match prints.as_u64() {
                Some(prints) => {
                    if prints > 2 {
                        return Err(E::custom("Invalid prints value received"));
                    } else {
                        prints as usize
                    }
                }
                None => return Err(E::custom("Expected an unsigned integer for prints")),
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
        let exposures = match map.get("exposures") {
            Some(exposures) => match exposures.as_u64() {
                Some(exposures) => exposures as usize,
                None => return Err(E::custom("Expected a boolean for exposures")),
            },
            None => return Err(E::missing_field("exposures")),
        };

        if num_rolls < 1 {
            return Err(E::custom("Number of rolls must be at least 1"));
        }

        Ok(FilmInfo {
            prints,
            digital,
            color,
            num_rolls,
            exposures,
        })
    }
}

impl FramingInfo {
    pub fn create_query(&self) -> (&'static str, mysql::Params) {
        (
            CREATE_FRAMING_QUERY,
            params! {
                "category" => &self.category,
                "width" => &self.width,
                "height" => &self.height,
            },
        )
    }

    pub fn parse<E: serde::de::Error>(
        map: &serde_json::Map<String, serde_json::Value>,
    ) -> Result<Self, E> {
        let category = match map.get("category") {
            Some(category) => match category.as_str() {
                Some(category) => category.to_owned(),
                None => return Err(E::custom("Expected a string for category")),
            },
            None => return Err(E::missing_field("category")),
        };
        let width = match map.get("width") {
            Some(width) => match width.as_u64() {
                Some(width) => width as usize,
                None => return Err(E::custom("Expected an unsigned integer for width")),
            },
            None => return Err(E::missing_field("width")),
        };
        let height = match map.get("height") {
            Some(height) => match height.as_u64() {
                Some(height) => height as usize,
                None => return Err(E::custom("Expected an unsigned integer for height")),
            },
            None => return Err(E::missing_field("num_rolls")),
        };

        if &category == "" {
            return Err(E::custom("Category must not be blank"));
        }

        if width < 1 {
            return Err(E::custom("Width must be at least 1"));
        }

        if height < 1 {
            return Err(E::custom("Height must be at least 1"));
        }

        Ok(FramingInfo {
            category,
            width,
            height,
        })
    }
}

impl PhotoshootInfo {
    pub fn create_query(&self) -> (&'static str, mysql::Params) {
        (
            CREATE_PHOTOSHOOT_QUERY,
            params! {
                "date_time" => &self.date_time,
                "type" => &self.photoshoot_type,
            },
        )
    }

    pub fn parse<E: serde::de::Error>(
        map: &serde_json::Map<String, serde_json::Value>,
    ) -> Result<Self, E> {
        let date_time = match map.get("date_time") {
            Some(date_time) => match date_time.as_str() {
                Some(date_time) => date_time.to_owned(),
                None => return Err(E::custom("Expected a string for date time")),
            },
            None => return Err(E::missing_field("date_time")),
        };
        let photoshoot_type = match map.get("type") {
            Some(photoshoot_type) => match photoshoot_type.as_u64() {
                Some(photoshoot_type) => photoshoot_type as usize,
                None => return Err(E::custom("Expected an unsigned integer for type")),
            },
            None => return Err(E::missing_field("type")),
        };

        Ok(PhotoshootInfo {
            date_time,
            photoshoot_type,
        })
    }
}
