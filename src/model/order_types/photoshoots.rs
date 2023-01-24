use mysql::prelude::FromRow;
use rocket::time::PrimitiveDateTime;
use serde::{ser::SerializeMap, Serialize};

use crate::model::render_date_time;

#[derive(Clone, Copy)]
pub enum PhotoshootType {
    FamilySession,
    ClassicCollection,
    LocationSession,
    BusinessHeadshot,
    StandardGraduationPhoto,
    LifestyleGraduation,
}

pub struct Photoshoot {
    id: usize,
    date_time: PrimitiveDateTime,
    photoshoot_type: PhotoshootType,
}

impl Photoshoot {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn date_time(&self) -> PrimitiveDateTime {
        self.date_time
    }

    pub fn photoshoot_type(&self) -> PhotoshootType {
        self.photoshoot_type
    }
}

impl FromRow for Photoshoot {
    fn from_row_opt(mut row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let id = match row.take("ID") {
            Some(id) => id,
            None => return Err(mysql::FromRowError(row)),
        };
        let date_time = match row.take("DateTime") {
            Some(date_time) => date_time,
            None => return Err(mysql::FromRowError(row)),
        };
        let photoshoot_type = match row.take("Type") {
            Some(photoshoot_type) => match photoshoot_type {
                1 => PhotoshootType::FamilySession,
                2 => PhotoshootType::ClassicCollection,
                3 => PhotoshootType::LocationSession,
                4 => PhotoshootType::BusinessHeadshot,
                5 => PhotoshootType::StandardGraduationPhoto,
                6 => PhotoshootType::LifestyleGraduation,
                _ => return Err(mysql::FromRowError(row)),
            },
            None => return Err(mysql::FromRowError(row)),
        };

        Ok(Photoshoot {
            id,
            date_time,
            photoshoot_type,
        })
    }
}

impl Serialize for Photoshoot {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(5))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry(
            "type",
            &match self.photoshoot_type {
                PhotoshootType::FamilySession => 1,
                PhotoshootType::ClassicCollection => 2,
                PhotoshootType::LocationSession => 3,
                PhotoshootType::BusinessHeadshot => 4,
                PhotoshootType::StandardGraduationPhoto => 5,
                PhotoshootType::LifestyleGraduation => 6,
            },
        )?;
        map.serialize_entry("date_time", &render_date_time(self.date_time))?;

        map.end()
    }
}
