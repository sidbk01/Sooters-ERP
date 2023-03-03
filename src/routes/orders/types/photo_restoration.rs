use crate::routes::RouteError;
use mysql::Params;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PhotoRestoration {}

impl PhotoRestoration {
    #[allow(unused)]
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {}
    #[allow(unused)]
    pub fn add_update_queries(&self, queries: &mut Vec<(&'static str, Params)>, id: usize) {}

    pub fn validate(&self) -> Result<(), RouteError> {
        Ok(())
    }
}
