use rocket::{Build, Rocket};

mod employee;
mod error;
mod static_assets;

pub use error::RouteError;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    employee::add_routes(static_assets::add_routes(server))
}
