use rocket::http::ContentType;
use rustc_hash::FxHashMap;
use std::path::Path;

pub struct ImageCache {
    files: FxHashMap<String, (ContentType, Vec<u8>)>,
}

fn load_directory<P: AsRef<Path>>(
    path: P,
    files: &mut FxHashMap<String, (ContentType, Vec<u8>)>,
) -> Result<(), std::io::Error> {
    let directory = std::fs::read_dir(path)?;

    for entry in directory {
        let entry = entry?;

        if entry.file_type()?.is_dir() {
            load_directory(entry.path(), files)?;
        } else {
            let path = entry.path();

            let content_type = match path.extension() {
                Some(extension) => match extension.to_str() {
                    Some(extension) => match extension {
                        "svg" => ContentType::SVG,
                        "jpg" | "jpeg" => ContentType::JPEG,
                        "png" => ContentType::PNG,
                        "bmp" => ContentType::BMP,
                        "ico" => ContentType::Icon,
                        _ => {
                            eprintln!("Warning: Unknown image extension \"{}\"", extension);
                            continue;
                        }
                    },
                    None => continue,
                },
                None => continue,
            };

            let file_contents = std::fs::read(&path)?;
            files.insert(
                path.file_stem().unwrap().to_string_lossy().into(),
                (content_type, file_contents),
            );
        }
    }

    Ok(())
}

impl ImageCache {
    pub fn load<P: AsRef<Path>>(base_path: P) -> Result<Self, std::io::Error> {
        let mut files = FxHashMap::default();

        load_directory(base_path, &mut files)?;

        Ok(ImageCache { files })
    }

    pub fn get(&self, name: &str) -> Option<(ContentType, &[u8])> {
        self.files
            .get(name)
            .map(|(image_type, image)| (image_type.clone(), image.as_slice()))
    }
}
