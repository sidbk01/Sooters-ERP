use rocket::{Build, Rocket};

mod css;
mod images;
mod js;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount("/", routes![css::css, images::images, js::js,])
}
