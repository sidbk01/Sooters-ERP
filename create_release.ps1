Write-Output "Building . . ."
cargo build --release

Write-Output "Copying required files"
Copy-Item -Path .\css -Destination .\release\css -Recurse
Copy-Item -Path .\js -Destination .\release\js -Recurse
Copy-Item -Path .\templates -Destination .\release\templates -Recurse
Copy-Item -Path .\target\release\sooters_erp.exe -Destination .\release\sooters_erp.exe

Write-Output "Packaging archive . . ."
Compress-Archive -Path .\release -DestinationPath .\sooters_erp.zip -Force

Write-Output "Cleaning intermediate directory . . ."
Remove-Item -Recurse -Force .\release