use rocket::{
    time::{Date, PrimitiveDateTime},
    Build, Rocket,
};

mod customers;
mod employees;
mod error;
mod index;
mod locations;
mod orders;
mod static_assets;

pub use error::RouteError;
pub use locations::Location;

pub(super) fn add_routes(mut server: Rocket<Build>) -> Rocket<Build> {
    server = static_assets::add_routes(server);
    server = employees::add_routes(server);
    server = orders::add_routes(server);
    server = customers::add_routes(server);

    server.mount("/", routes![locations::get, index::get])
}

fn format_date(date: Date) -> String {
    format!("{} {}, {}", date.month(), date.day(), date.year())
}

fn format_date_time(date_time: PrimitiveDateTime) -> String {
    let (hour, m) = if date_time.hour() == 0 || date_time.hour() == 24 {
        (12, "AM")
    } else if date_time.hour() < 12 {
        (date_time.hour(), "AM")
    } else if date_time.hour() == 12 {
        (date_time.hour(), "PM")
    } else {
        (date_time.hour() - 12, "PM")
    };

    format!(
        "{}:{:02} {} {}",
        hour,
        date_time.minute(),
        m,
        format_date(date_time.date())
    )
}
