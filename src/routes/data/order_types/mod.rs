use rocket::{Build, Rocket};

mod film;
mod framing;
mod photoshoot;

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount(
        "/data/order",
        routes![film::film, framing::framing, photoshoot::photoshoot],
    )
}
