use rocket::{Build, Rocket};

mod employee;
mod error;
mod locations;
mod static_assets;

pub use error::RouteError;
pub use locations::Location;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    employee::add_routes(static_assets::add_routes(server)).mount("/", routes![locations::get])
}
