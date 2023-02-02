use crate::{
    routes::{customers::CustomerName, RouteError},
    state::State,
};
use mysql::params;
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/orders/create?<customer>")]
pub(super) async fn view(
    customer: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let customer_info: CustomerName = state
        .database()
        .execute_query_parameters(
            "SELECT ID, FirstName, LastName FROM Customers WHERE ID = :id",
            params! {"id" => customer},
        )
        .await?
        .pop()
        .unwrap();

    let mut context = Context::new();
    context.insert("customer", &customer);
    context.insert("customer_name", customer_info.name());

    state.render("create_order.html", context)
}
