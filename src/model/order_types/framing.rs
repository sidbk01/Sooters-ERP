use mysql::prelude::FromRow;
use serde::{ser::SerializeMap, Serialize};

pub struct FramingOrder {
    id: usize,
    category: String,
    width: usize,
    height: usize,
}

impl FramingOrder {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn category(&self) -> &str {
        &self.category
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }
}

impl FromRow for FramingOrder {
    fn from_row_opt(mut row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let id = match row.take("ID") {
            Some(id) => id,
            None => return Err(mysql::FromRowError(row)),
        };
        let category = match row.take("Category") {
            Some(category) => category,
            None => return Err(mysql::FromRowError(row)),
        };
        let width = match row.take("Width") {
            Some(width) => width,
            None => return Err(mysql::FromRowError(row)),
        };
        let height = match row.take("Height") {
            Some(height) => height,
            None => return Err(mysql::FromRowError(row)),
        };

        Ok(FramingOrder {
            id,
            category,
            width,
            height,
        })
    }
}

impl Serialize for FramingOrder {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(5))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("category", &self.category)?;
        map.serialize_entry("width", &self.width)?;
        map.serialize_entry("height", &self.height)?;

        map.end()
    }
}
