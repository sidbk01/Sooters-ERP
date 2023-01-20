use crate::{database::DatabaseError, state::State};
use rocket::{http::Status, response::Responder};

#[derive(Debug)]
pub enum RouteError {
    RenderError(tera::Error),
    DatabaseError(DatabaseError),
    JSError(String),
    CSSError(String),
    InputError(&'static str),
}

impl<'r, 'o: 'r> Responder<'r, 'o> for RouteError {
    fn respond_to(self, request: &'r rocket::Request<'_>) -> rocket::response::Result<'o> {
        request
            .rocket()
            .state::<State>()
            .map(|state| state.log_error(&self));
        eprintln!("{}", self);
        Status::InternalServerError.respond_to(request)
    }
}

impl From<tera::Error> for RouteError {
    fn from(error: tera::Error) -> Self {
        RouteError::RenderError(error)
    }
}

impl From<DatabaseError> for RouteError {
    fn from(error: DatabaseError) -> Self {
        RouteError::DatabaseError(error)
    }
}

impl std::error::Error for RouteError {}

impl std::fmt::Display for RouteError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Error while processing route: ")?;

        match self {
            RouteError::RenderError(error) => {
                writeln!(f, "Unable to render template - {}", error)
            }
            RouteError::DatabaseError(error) => writeln!(f, "{}", error),
            RouteError::JSError(file) => writeln!(f, "Unable to find JS file \"{}\"", file),
            RouteError::CSSError(file) => writeln!(f, "Unable to find CSS file \"{}\"", file),
            RouteError::InputError(message) => writeln!(f, "Invalid input recieved - {}", message),
        }
    }
}
