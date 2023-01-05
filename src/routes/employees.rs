use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/employees?<active>")]
pub(super) async fn all(
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
pub(super) async fn one(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("id", &id);

    Ok(RawHtml(
        state.templates().render("employee.html", &context)?,
    ))
}

#[get("/employees/create")]
pub(super) async fn create(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    Ok(RawHtml(
        state
            .templates()
            .render("create_employee.html", &Context::new())?,
    ))
}
