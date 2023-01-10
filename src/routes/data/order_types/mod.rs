use rocket::{Build, Rocket};

mod film;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount("/data/order", routes![film::film])
}
