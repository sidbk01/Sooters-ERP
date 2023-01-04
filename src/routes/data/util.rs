pub(super) fn validate_empty(value: &mut Option<String>) {
    match value {
        Some(string) => match string == "" {
            true => *value = None,
            false => {}
        },
        None => {}
    }
}
