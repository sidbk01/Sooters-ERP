use rocket::time::{Date, PrimitiveDateTime};

mod customer;
mod employee;
mod location;
mod order;
mod order_types;

pub use customer::{Customer, CustomerNote};
pub use employee::Employee;
pub use location::Location;
pub use order::{Order, OrderNote, OrderType};
pub use order_types::*;

fn render_date(date: Date) -> String {
    format!("{} {}, {}", date.month(), date.day(), date.year())
}

fn render_date_time(date_time: PrimitiveDateTime) -> String {
    let (hour, m) = if date_time.hour() == 0 {
        (12, "AM")
    } else if date_time.hour() > 12 {
        (date_time.hour() - 12, "PM")
    } else {
        (date_time.hour(), "AM")
    };

    format!(
        "{}:{} {} {}",
        hour,
        date_time.minute(),
        m,
        render_date(date_time.date())
    )
}
