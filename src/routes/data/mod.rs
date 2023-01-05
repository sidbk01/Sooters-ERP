use rocket::{Build, Rocket};

mod customers;
mod employees;
mod locations;
mod util;

pub(self) use util::*;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount(
        "/data",
        routes![
            customers::all,
            customers::one,
            customers::update,
            customers::create,
            customers::notes,
            customers::create_note,
            employees::all,
            employees::one,
            employees::set_active,
            employees::update,
            employees::create,
            locations::all
        ],
    )
}
