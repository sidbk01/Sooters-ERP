use mysql::{params, Params};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct FramingOrder {
    category: String,
    width: usize,
    height: usize,
}

impl FramingOrder {
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        queries.push((
            "INSERT INTO Framing_Orders (ID, Category, Width, Height) VALUES (@order_id, :category, :width, :height)",
            params! {
                "category" => &self.category,
                "width" => &self.width,
                "height" => &self.height,
            }
        ))
    }
}
