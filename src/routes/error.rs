use crate::{state::DatabaseError, state::State};
use rocket::{
    http::Status,
    response::{Builder, Responder},
    Response,
};
use std::io::Cursor;

#[derive(Debug)]
pub enum RouteError {
    RenderError(tera::Error),
    DatabaseError(DatabaseError),
    JSError(String),
    CSSError(String),
    ImageError(String),
    InputError(&'static str),
}

fn build_error_response<'a, E: ToString>(error: E, status: Status) -> Response<'a> {
    let body = error.to_string();

    let mut builder = Builder::new(Response::new());
    builder.status(status);
    builder.raw_header("Content-Type", "text/plain");
    builder.sized_body(body.len(), Cursor::new(body));

    builder.finalize()
}

impl<'r, 'o: 'r> Responder<'r, 'o> for RouteError {
    fn respond_to(self, request: &'r rocket::Request<'_>) -> rocket::response::Result<'o> {
        request
            .rocket()
            .state::<State>()
            .map(|state| state.log_error(&self));

        eprintln!("{}", self);

        match self {
            RouteError::RenderError(_) => Status::InternalServerError.respond_to(request),
            RouteError::DatabaseError(error) => {
                Ok(build_error_response(error, Status::InternalServerError))
            }
            RouteError::CSSError(_) | RouteError::ImageError(_) | RouteError::JSError(_) => {
                Ok(build_error_response(self, Status::NotFound))
            }
            RouteError::InputError(_) => Ok(build_error_response(self, Status::ExpectationFailed)),
        }
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
            RouteError::ImageError(file) => writeln!(f, "Unable to find image file \"{}\"", file),
            RouteError::InputError(message) => writeln!(f, "Invalid input recieved - {}", message),
        }
    }
}
