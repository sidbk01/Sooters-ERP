use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/employees?<active>")]
pub(super) async fn employees(
    active: Option<bool>,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("active", &active.unwrap_or(true));

    Ok(RawHtml(
        state.templates().render("employees.html", &context)?,
    ))
}

#[get("/employee?<id>")]
pub(super) async fn employee(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("id", &id);

    Ok(RawHtml(
        state.templates().render("employee.html", &context)?,
    ))
}
