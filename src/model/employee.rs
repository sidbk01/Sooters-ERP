use mysql::{
    prelude::FromRow,
    serde::{ser::SerializeMap, Serialize},
};

pub struct Employee {
    id: usize,
    name: String,
    primary_location: usize,
}

impl Employee {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn primary_location(&self) -> usize {
        self.primary_location
    }
}

impl FromRow for Employee {
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
        let primary_location = row
            .take("PrimaryLocation")
            .ok_or(mysql::FromRowError(row))?;

        Ok(Employee {
            id,
            name,
            primary_location,
        })
    }
}

impl Serialize for Employee {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: mysql::serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(3))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("name", &self.name)?;
        map.serialize_entry("primary_location", &self.primary_location)?;

        map.end()
    }
}
