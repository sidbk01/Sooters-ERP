use mysql::{
    prelude::FromRow,
    serde::{ser::SerializeMap, Serialize},
};

pub struct Location {
    id: usize,
    name: String,
    address: usize,
}

impl Location {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn address(&self) -> usize {
        self.address
    }
}

impl FromRow for Location {
    fn from_row_opt(mut row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let id = match row.take("ID") {
            Some(id) => id,
            None => return Err(mysql::FromRowError(row)),
        };
        let name = match row.take("Name") {
            Some(name) => name,
            None => return Err(mysql::FromRowError(row)),
        };
        let address = row.take("Address").ok_or(mysql::FromRowError(row))?;

        Ok(Location { id, name, address })
    }
}

impl Serialize for Location {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: mysql::serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(3))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("name", &self.name)?;
        map.serialize_entry("address", &self.address)?;

        map.end()
    }
}
