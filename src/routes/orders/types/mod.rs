use mysql::Params;
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
}
