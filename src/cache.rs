use rustc_hash::FxHashMap;
use std::path::Path;

pub struct FileCache {
    files: FxHashMap<String, String>,
}

fn load_directory<P: AsRef<Path>>(
    path: P,
    files: &mut FxHashMap<String, String>,
) -> Result<(), std::io::Error> {
    let directory = std::fs::read_dir(path)?;

    for entry in directory {
        let entry = entry?;

        if entry.file_type()?.is_dir() {
            load_directory(entry.path(), files)?;
        } else {
            let path = entry.path();

            let file_contents = std::fs::read_to_string(&path)?;
            files.insert(
                path.file_stem().unwrap().to_string_lossy().into(),
                file_contents,
            );
        }
    }

    Ok(())
}

impl FileCache {
    pub fn load<P: AsRef<Path>>(base_path: P) -> Result<Self, std::io::Error> {
        let mut files = FxHashMap::default();

        load_directory(base_path, &mut files)?;

        Ok(FileCache { files })
    }

    pub fn get(&self, name: &str) -> Option<&str> {
        self.files.get(name).map(|file| file.as_str())
    }
}
