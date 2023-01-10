use rocket::{Build, Rocket};

mod css;
mod customers;
mod data;
mod employees;
mod error;
mod index;
mod js;
mod orders;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    data::add_routes(server).mount(
        "/",
        routes! {
            js::js,
            css::css,
            index::index,
            customers::all,
            customers::one,
            customers::create,
            employees::all,
            employees::one,
            employees::create,
            orders::all,
            orders::one,
            orders::create,
        },
    )
}
