use rocket::{Build, Rocket};

mod customers;
mod employees;
mod locations;
mod order_types;
mod orders;
mod util;

pub(self) use util::*;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    order_types::add_routes(server).mount(
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
            locations::all,
            orders::all,
            orders::one,
            orders::upcoming,
            orders::recent,
            orders::types,
            orders::create,
            orders::paid,
            orders::completed,
            orders::picked_up,
            orders::change_location,
            orders::notes,
            orders::create_note,
        ],
    )
}
