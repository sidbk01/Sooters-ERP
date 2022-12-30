use crate::database::DatabaseError;
use rocket::{http::Status, response::Responder};

pub enum RouteError {
    RenderError(tera::Error),
    DatabaseError(DatabaseError),
}

impl<'r, 'o: 'r> Responder<'r, 'o> for RouteError {
    fn respond_to(self, request: &'r rocket::Request<'_>) -> rocket::response::Result<'o> {
        eprint!("Error while processing route: ");

        match self {
            RouteError::RenderError(error) => {
                eprintln!("Unable to render template - {}", error);
            }
            RouteError::DatabaseError(error) => eprintln!("{}", error),
        }

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
