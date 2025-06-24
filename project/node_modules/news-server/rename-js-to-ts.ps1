# Get all .js files recursively in the dist directory
$jsFiles = Get-ChildItem -Path ".\dist" -Recurse -Filter "*.js"

foreach ($file in $jsFiles) {
    $newName = $file.FullName -replace '\.js$', '.ts'
    
    # Check if the file is not already a .ts file (just in case)
    if ($file.FullName -ne $newName) {
        Write-Host "Renaming $($file.FullName) to $newName"
        Rename-Item -Path $file.FullName -NewName $newName -Force
    }
}

Write-Host "All .js files have been renamed to .ts" -ForegroundColor Green
