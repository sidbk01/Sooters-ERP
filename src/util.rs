use mysql::{prelude::FromValue, FromRowError, Row};

pub fn take_from_row<T: FromValue>(
    mut row: Row,
    name: &'static str,
) -> Result<(Row, T), FromRowError> {
    match row.take(name) {
        Some(element) => Ok((row, element)),
        None => Err(FromRowError(row)),
    }
}
