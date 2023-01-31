use rocket::{Build, Rocket};

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

    server.mount("/", routes![locations::get, index::get])
}
