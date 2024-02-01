use super::Order;
use crate::{
    routes::{customers::CustomerName, RouteError},
    state::State,
};
use mysql::{params, serde_json};
use rocket::response::content::{RawHtml, RawJson};
use tera::Context;

#[get("/orders?<id>")]
pub(crate) async fn customer_view(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let customer: CustomerName = state
        .database()
        .execute_query_parameters(
            "SELECT ID, FirstName, LastName FROM Customers WHERE ID = :id",
            params! {"id" => id},
        )
        .await?
        .pop()
        .unwrap();

    let mut context = Context::new();
    context.insert("id", &id);
    context.insert("customer_name", customer.name());

    state.render("customer_orders.html", context)
}

#[get("/orders/customer?<id>")]
pub(crate) async fn customer_data(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    let orders: Vec<Order> = state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Orders WHERE Customer = :id ORDER BY DateDue ASC, FormattedID DESC",
            params! {
                "id" => &id,
            },
        )
        .await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}

#[get("/orders/upcoming")]
pub(crate) async fn upcoming(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    let orders: Vec<Order> = state
        .database()
        .execute_query("
            SELECT * FROM Orders 
            WHERE (DateDue BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 14 DAY))
            OR DateComplete IS NULL
            ORDER BY DateDue ASC, FormattedID ASC
        ")
        .await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}

#[get("/orders/recent")]
pub(super) fn recent_view(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    state.render("recent.html", Context::new())
}

#[get("/orders/recent/data")]
pub(crate) async fn recent_data(
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    let orders: Vec<Order> = state
        .database()
        .execute_query("SELECT * FROM Orders WHERE DateReceived >= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY DateReceived ASC, FormattedID ASC")
        .await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}
