use rocket::request::FromSegments;
use rustc_hash::FxHashMap;
use std::path::Path;

pub struct FileCache {
    files: FxHashMap<String, String>,
}

pub struct FilePath(pub String);

fn load_directory<P: AsRef<Path>>(
    path: P,
    prefix: &str,
    files: &mut FxHashMap<String, String>,
) -> Result<(), std::io::Error> {
    let directory = std::fs::read_dir(path)?;

    for entry in directory {
        let entry = entry?;
        let path = entry.path();

        if entry.file_type()?.is_dir() {
            let new_prefix = if prefix == "" {
                path.file_stem().unwrap().to_string_lossy().into()
            } else {
                format!("{}/{}", prefix, path.file_stem().unwrap().to_string_lossy())
            };

            load_directory(entry.path(), &new_prefix, files)?;
        } else {
            let file_contents = std::fs::read_to_string(&path)?;
            files.insert(
                if prefix == "" {
                    path.file_stem().unwrap().to_string_lossy().into()
                } else {
                    format!("{}/{}", prefix, path.file_stem().unwrap().to_string_lossy())
                },
                file_contents,
            );
        }
    }

    Ok(())
}

impl FileCache {
    pub fn load<P: AsRef<Path>>(base_path: P) -> Result<Self, std::io::Error> {
        let mut files = FxHashMap::default();

        load_directory(base_path, "", &mut files)?;

        Ok(FileCache { files })
    }

    pub fn get(&self, name: &str) -> Option<&str> {
        self.files.get(name).map(|file| file.as_str())
    }

    pub fn print(&self) {
        for key in self.files.keys() {
            println!("  {}", key);
        }
    }
}

impl<'r> FromSegments<'r> for FilePath {
    type Error = ();

    fn from_segments(
        segments: rocket::http::uri::Segments<'r, rocket::http::uri::fmt::Path>,
    ) -> Result<Self, Self::Error> {
        let mut file_path = String::new();
        let mut first = true;
        for segment in segments {
            if first {
                first = false;
            } else {
                file_path.push('/');
            }

            file_path.push_str(segment);
        }

        Ok(FilePath(file_path))
    }
}
