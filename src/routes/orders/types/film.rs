use mysql::{params, Params};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct NewFilmOrder {
    prints: usize,
    digital: bool,
    rolls: Vec<NewFilmRoll>,
}

#[derive(Deserialize)]
pub struct NewFilmRoll {
    amount: usize,
    exposures: usize,
    film_type: usize,
}

impl NewFilmOrder {
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        queries.push((
            "INSERT INTO Film_Orders (ID, Prints, Digital) VALUES (@order_id, :prints, :digital)",
            params! {
                "prints" => &self.prints,
                "digital" => &self.digital,
            },
        ));

        for roll in &self.rolls {
            roll.add_queries(queries);
        }
    }
}

impl NewFilmRoll {
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        queries.push((
            "INSERT INTO Film_Rolls (OrderID, Quantity, Exposures, Type) VALUES (@order_id, :quantity, :exposures, :type)",
            params! {
                "quantity" => &self.amount,
                "exposures" => &self.exposures,
                "type" => &self.film_type,
            }
        ))
    }
}
