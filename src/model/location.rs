use mysql::prelude::FromRow;

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
