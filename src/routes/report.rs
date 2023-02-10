use crate::{
    routes::RouteError,
    state::{Empty, State},
};
use mysql::params;
use rocket::{response::content::RawHtml, serde::json::Json};
use serde::Deserialize;
use tera::Context;

#[derive(Deserialize)]
pub struct Report {
    page: String,
    level: usize,
    message: String,
    logs: String,
    user_agent: String,
    resolution: String,
}

#[get("/report?<back>")]
pub(super) fn get(
    back: String,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("back", &back);

    println!("{back}");

    state.render("report.html", context)
}

#[post("/report", data = "<info>")]
pub(super) async fn post(
    info: Json<Report>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    // Validate input
    if &info.message == "" {
        return Err(RouteError::InputError(
            "Cannot create a report without a message",
        ));
    }

    // Perform query
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            "INSERT INTO Reports (Page, Level, Message, Logs, UserAgent, Resolution) VALUES (:page, :level, :message, :logs, :user_agent, :resolution)",
            params! {
                "page" => &info.page,
                "level" => &info.level,
                "message" => &info.message,
                "logs" => &info.logs,
                "user_agent" => &info.user_agent,
                "resolution" => &info.resolution,
            },
        )
        .await?;

    Ok(String::new())
}
