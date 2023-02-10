Write-Output "Building . . ."
cargo build --release
npm run build

Write-Output "Copying required files"
Copy-Item -Path .\css -Destination .\release\css -Recurse -Force
Copy-Item -Path .\js -Destination .\release\js -Recurse -Force
Copy-Item -Path .\images -Destination .\release\images -Recurse -Force
Copy-Item -Path .\templates -Destination .\release\templates -Recurse -Force
Copy-Item -Path .\target\release\sooters_erp.exe -Destination .\release\sooters_erp.exe

Write-Output "Packaging archive . . ."
Compress-Archive -Path .\release -DestinationPath .\sooters_erp.zip -Force

Write-Output "Cleaning intermediate directory . . ."
Remove-Item -Recurse -Force .\release