use crate::{routes::error::RouteError, state::State, Employee, Location};
use mysql::serde::{ser::SerializeMap, Serialize};
use rocket::response::content::RawHtml;
use rustc_hash::FxHashMap;
use tera::Context;

struct LocationWithEmployees {
    location: Location,
    employees: Vec<Employee>,
}

#[get("/employees")]
pub(super) async fn employees(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    // Get the locations
    let locations = state.database().locations().await?;

    // Get the employees
    let employees = state.database().employees().await?;

    // Combine them together
    let mut locations_with_employees = Vec::with_capacity(locations.len());
    let mut location_ids = FxHashMap::default();
    for location in locations {
        location_ids.insert(location.id(), locations_with_employees.len());
        locations_with_employees.push(LocationWithEmployees {
            location,
            employees: Vec::new(),
        });
    }

    for employee in employees {
        locations_with_employees[*location_ids.get(&employee.primary_location()).unwrap()]
            .employees
            .push(employee);
    }

    // Create the context
    let mut context = Context::new();
    context.insert("locations", &locations_with_employees);

    // Render the page
    Ok(RawHtml(
        state.templates().render("employees.html", &context)?,
    ))
}

impl Serialize for LocationWithEmployees {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: mysql::serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(2))?;

        map.serialize_entry("name", self.location.name())?;
        map.serialize_entry("employees", &self.employees)?;

        map.end()
    }
}
