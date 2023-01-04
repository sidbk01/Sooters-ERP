use rocket::{Build, Rocket};

mod css;
mod customers;
mod data;
mod employees;
mod error;
mod index;
mod js;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    data::add_routes(server).mount(
        "/",
        routes! {
            js::js,
            css::css,
            index::index,
            customers::customers,
            customers::customer,
            employees::employees,
            employees::employee
        },
    )
}
