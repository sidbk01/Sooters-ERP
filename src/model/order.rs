use super::{render_date, render_date_time};
use mysql::prelude::FromRow;
use rocket::time::{Date, PrimitiveDateTime};
use serde::{ser::SerializeMap, Serialize};

pub struct Order {
    id: usize,
    envelope_id: Option<usize>,
    current_location: usize,
    source_location: usize,
    receiver: usize,
    order_type: usize,
    customer: usize,
    date_received: Date,
    date_due: Date,
    date_complete: Option<Date>,
    paid: bool,
    rush: bool,
    picked_up: bool,
    formatted_id: String,
}

pub struct OrderNote {
    id: usize,
    order: usize,
    creator: usize,
    date_time: PrimitiveDateTime,
    note: String,
}

pub struct OrderType {
    id: usize,
    name: String,
}

impl Order {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn envelope_id(&self) -> Option<usize> {
        self.envelope_id
    }

    pub fn current_location(&self) -> usize {
        self.current_location
    }

    pub fn source_location(&self) -> usize {
        self.source_location
    }

    pub fn receiver(&self) -> usize {
        self.receiver
    }

    pub fn order_type(&self) -> usize {
        self.order_type
    }

    pub fn customer(&self) -> usize {
        self.customer
    }

    pub fn date_received(&self) -> Date {
        self.date_received
    }

    pub fn date_due(&self) -> Date {
        self.date_due
    }

    pub fn date_complete(&self) -> Option<Date> {
        self.date_complete
    }

    pub fn paid(&self) -> bool {
        self.paid
    }

    pub fn rush(&self) -> bool {
        self.rush
    }
}

impl FromRow for Order {
    fn from_row_opt(mut row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let id = match row.take("ID") {
            Some(id) => id,
            None => return Err(mysql::FromRowError(row)),
        };
        let envelope_id = match row.take("EnvelopeID") {
            Some(envelope_id) => envelope_id,
            None => return Err(mysql::FromRowError(row)),
        };
        let current_location = match row.take("CurrentLocation") {
            Some(current_location) => current_location,
            None => return Err(mysql::FromRowError(row)),
        };
        let source_location = match row.take("SourceLocation") {
            Some(source_location) => source_location,
            None => return Err(mysql::FromRowError(row)),
        };
        let receiver = match row.take("Receiver") {
            Some(receiver) => receiver,
            None => return Err(mysql::FromRowError(row)),
        };
        let order_type = match row.take("OrderType") {
            Some(order_type) => order_type,
            None => return Err(mysql::FromRowError(row)),
        };
        let customer = match row.take("Customer") {
            Some(customer) => customer,
            None => return Err(mysql::FromRowError(row)),
        };
        let date_received = match row.take("DateReceived") {
            Some(date_received) => date_received,
            None => return Err(mysql::FromRowError(row)),
        };
        let date_due = match row.take("DateDue") {
            Some(date_due) => date_due,
            None => return Err(mysql::FromRowError(row)),
        };
        let date_complete = match row.take("DateComplete") {
            Some(date_complete) => date_complete,
            None => return Err(mysql::FromRowError(row)),
        };
        let paid = match row.take("Paid") {
            Some(paid) => paid,
            None => return Err(mysql::FromRowError(row)),
        };
        let rush = match row.take("Rush") {
            Some(rush) => rush,
            None => return Err(mysql::FromRowError(row)),
        };
        let picked_up = match row.take("PickedUp") {
            Some(picked_up) => picked_up,
            None => return Err(mysql::FromRowError(row)),
        };
        let formatted_id = match row.take("FormattedID") {
            Some(formatted_id) => formatted_id,
            None => return Err(mysql::FromRowError(row)),
        };

        Ok(Order {
            id,
            envelope_id,
            current_location,
            source_location,
            receiver,
            order_type,
            customer,
            date_received,
            date_due,
            date_complete,
            paid,
            rush,
            picked_up,
            formatted_id,
        })
    }
}

impl Serialize for Order {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(12))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("envelope_id", &self.envelope_id)?;
        map.serialize_entry("current_location", &self.current_location)?;
        map.serialize_entry("source_location", &self.source_location)?;
        map.serialize_entry("receiver", &self.receiver)?;
        map.serialize_entry("type", &self.order_type)?;
        map.serialize_entry("customer", &self.customer)?;
        map.serialize_entry("date_received", &render_date(self.date_received))?;
        map.serialize_entry("date_due", &render_date(self.date_due))?;
        map.serialize_entry(
            "date_complete",
            &self.date_complete.map(|date| render_date(date)),
        )?;
        map.serialize_entry("paid", &self.paid)?;
        map.serialize_entry("rush", &self.rush)?;
        map.serialize_entry("picked_up", &self.picked_up)?;
        map.serialize_entry("formatted_id", &self.formatted_id)?;

        map.end()
    }
}

impl OrderType {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn name(&self) -> &str {
        &self.name
    }
}

impl FromRow for OrderType {
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

        Ok(OrderType { id, name })
    }
}

impl Serialize for OrderType {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(12))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("name", &self.name)?;

        map.end()
    }
}

impl OrderNote {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn order(&self) -> usize {
        self.order
    }

    pub fn creator(&self) -> usize {
        self.creator
    }

    pub fn date_time(&self) -> PrimitiveDateTime {
        self.date_time
    }
}

impl FromRow for OrderNote {
    fn from_row_opt(mut row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let id = match row.take("ID") {
            Some(id) => id,
            None => return Err(mysql::FromRowError(row)),
        };
        let order = match row.take("OrderID") {
            Some(order) => order,
            None => return Err(mysql::FromRowError(row)),
        };
        let creator = match row.take("Creator") {
            Some(creator) => creator,
            None => return Err(mysql::FromRowError(row)),
        };
        let date_time = match row.take("DateTime") {
            Some(date_time) => date_time,
            None => return Err(mysql::FromRowError(row)),
        };
        let note = match row.take("Note") {
            Some(note) => note,
            None => return Err(mysql::FromRowError(row)),
        };

        Ok(OrderNote {
            id,
            order,
            creator,
            date_time,
            note,
        })
    }
}

impl Serialize for OrderNote {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(5))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("order", &self.order)?;
        map.serialize_entry("creator", &self.creator)?;
        map.serialize_entry("date_time", &render_date_time(self.date_time))?;
        map.serialize_entry("note", &self.note)?;
        map.end()
    }
}
