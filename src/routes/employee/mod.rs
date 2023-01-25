use rocket::{Build, Rocket};

mod create;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount("/", routes![create::get_create, create::post_create])
}
