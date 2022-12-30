use rocket::{Build, Rocket};

mod employees;
mod error;
mod index;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount("/", routes! {index::index, employees::employees})
}
