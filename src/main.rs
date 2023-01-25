#[macro_use]
extern crate rocket;
extern crate mysql;
extern crate serde;

mod config;
mod routes;
mod state;
mod util;

const DEFAULT_CONFIG_PATH: &'static str = "./config.json";

fn display_error(error: &dyn std::error::Error) {
    eprintln!("Error: {}", error);
}

fn config_path() -> String {
    // Get the arguments
    let mut args = std::env::args();

    // Ignore the first
    args.next();

    // Use the second, if available
    args.next().unwrap_or(DEFAULT_CONFIG_PATH.to_owned())
}

#[main]
async fn main() -> Result<(), rocket::Error> {
    // Load the configuration and create the state
    let state = match state::State::new(config_path()).await {
        Ok(state) => state,
        Err(error) => {
            display_error(&error);
            return Ok(());
        }
    };

    // Build the server
    let server = routes::add_routes(rocket::build().manage(state));

    // Launch the server
    let _ = server.ignite().await?.launch().await?;
    Ok(())
}
