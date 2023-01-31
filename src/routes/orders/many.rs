use super::Order;
use crate::{routes::RouteError, state::State};
use mysql::serde_json;
use rocket::response::content::RawJson;

#[get("/orders/upcoming")]
pub(crate) async fn upcoming(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    let orders: Vec<Order> = state
        .database()
        .execute_query("SELECT * FROM Orders WHERE DateDue BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) ORDER BY DateDue ASC, FormattedID DESC")
        .await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}
