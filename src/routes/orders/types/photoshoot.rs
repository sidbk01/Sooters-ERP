use mysql::{params, Params};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Photoshoot {
    date_time: String,
    photoshoot_type: usize,
}

impl Photoshoot {
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        queries.push((
            "INSERT INTO Photoshoots (ID, DateTime, Type) VALUES (@order_id, :date_time, :type)",
            params! {
                "date_time" => &self.date_time,
                "photoshoot_type" => &self.photoshoot_type,
            },
        ))
    }
}
