use crate::routes::RouteError;
use mysql::Params;
use rocket::{Build, Rocket};
use serde::Deserialize;

mod film;
mod framing;
mod photoshoot;

#[derive(Deserialize)]
pub enum NewOrderType {
    Film(film::NewFilmOrder),
    Framing(framing::FramingOrder),
    Photoshoot(photoshoot::Photoshoot),
}

#[derive(Deserialize)]
pub enum UpdatedOrderType {
    Film(film::FilmOrder),
    Framing(framing::FramingOrder),
    Photoshoot(photoshoot::Photoshoot),
}

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount(
        "/",
        routes![
            framing::get,
            photoshoot::get,
            film::get_film,
            film::get_rolls,
            film::get_scancodes,
            film::new_scancodes,
        ],
    )
}

impl NewOrderType {
    pub fn as_usize(&self) -> usize {
        match self {
            NewOrderType::Film(_) => 1,
            NewOrderType::Framing(_) => 2,
            NewOrderType::Photoshoot(_) => 3,
        }
    }

    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        match self {
            NewOrderType::Film(film) => film.add_queries(queries),
            NewOrderType::Framing(framing) => framing.add_queries(queries),
            NewOrderType::Photoshoot(photoshoot) => photoshoot.add_queries(queries),
        }
    }

    pub fn validate(&self) -> Result<(), RouteError> {
        match self {
            NewOrderType::Film(film) => film.validate(),
            NewOrderType::Framing(framing) => framing.validate(),
            NewOrderType::Photoshoot(photoshoot) => photoshoot.validate(),
        }
    }
}

impl UpdatedOrderType {
    pub fn add_update_queries(&self, queries: &mut Vec<(&'static str, Params)>, id: usize) {
        match self {
            UpdatedOrderType::Film(film) => film.add_update_queries(queries, id),
            UpdatedOrderType::Framing(framing) => framing.add_update_queries(queries, id),
            UpdatedOrderType::Photoshoot(photoshoot) => photoshoot.add_update_queries(queries, id),
        }
    }

    pub fn validate(&self) -> Result<(), RouteError> {
        match self {
            UpdatedOrderType::Film(film) => film.validate(),
            UpdatedOrderType::Framing(framing) => framing.validate(),
            UpdatedOrderType::Photoshoot(photoshoot) => photoshoot.validate(),
        }
    }
}
