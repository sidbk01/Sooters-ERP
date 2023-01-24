use mysql::prelude::FromRow;
use serde::{ser::SerializeMap, Serialize};

#[derive(Clone, Copy)]
pub enum PrintType {
    None,
    Matte,
    Glossy,
}

pub struct FilmOrder {
    id: usize,
    prints: PrintType,
    digital: bool,
    number_of_rolls: usize,
    color: bool,
    exposures: usize,
}

impl FilmOrder {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn prints(&self) -> PrintType {
        self.prints
    }

    pub fn digital(&self) -> bool {
        self.digital
    }

    pub fn number_of_rolls(&self) -> usize {
        self.number_of_rolls
    }

    pub fn color(&self) -> bool {
        self.color
    }

    pub fn exposures(&self) -> usize {
        self.exposures
    }
}

impl FromRow for FilmOrder {
    fn from_row_opt(mut row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let id = match row.take("ID") {
            Some(id) => id,
            None => return Err(mysql::FromRowError(row)),
        };
        let prints = match row.take("Prints") {
            Some(prints) => match prints {
                0 => PrintType::None,
                1 => PrintType::Matte,
                2 => PrintType::Glossy,
                _ => return Err(mysql::FromRowError(row)),
            },
            None => return Err(mysql::FromRowError(row)),
        };
        let digital = match row.take("Digital") {
            Some(digital) => digital,
            None => return Err(mysql::FromRowError(row)),
        };
        let number_of_rolls = match row.take("NumberOfRolls") {
            Some(number_of_rolls) => number_of_rolls,
            None => return Err(mysql::FromRowError(row)),
        };
        let color = match row.take("Color") {
            Some(color) => color,
            None => return Err(mysql::FromRowError(row)),
        };
        let exposures = match row.take("Exposures") {
            Some(exposures) => exposures,
            None => return Err(mysql::FromRowError(row)),
        };

        Ok(FilmOrder {
            id,
            prints,
            digital,
            number_of_rolls,
            color,
            exposures
        })
    }
}

impl Serialize for FilmOrder {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(5))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry(
            "prints",
            &match self.prints {
                PrintType::None => 0,
                PrintType::Matte => 1,
                PrintType::Glossy => 2,
            },
        )?;
        map.serialize_entry("digital", &self.digital)?;
        map.serialize_entry("num_rolls", &self.number_of_rolls)?;
        map.serialize_entry("color", &self.color)?;
        map.serialize_entry("exposures", &self.exposures)?;

        map.end()
    }
}
