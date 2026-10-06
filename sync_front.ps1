$OutputFile = "codebase_front.txt"
Clear-Content $OutputFile -ErrorAction SilentlyContinue

$files = @()

# 1. Récupérer les fichiers de configuration à la racine
$configFiles = @(
    "package.json",
    "tailwind.config.ts",
    "tailwind.config.js",
    "postcss.config.mjs",
    "postcss.config.js",
    "next.config.mjs",
    "next.config.ts",
    "tsconfig.json"
)

foreach ($configFile in $configFiles) {
    if (Test-Path .\$configFile) {
        $files += Get-Item .\$configFile
    }
}

# 2. Récupérer tout le code source (TypeScript, React, CSS) dans le dossier src
if (Test-Path .\src) {
    $files += Get-ChildItem -Path .\src\ -Recurse -Include *.tsx, *.ts, *.css | Where-Object { $_.FullName -notmatch "node_modules|\.next" }
}

# 3. Fusionner le tout dans le fichier texte
foreach ($file in $files) {
    if ($file -ne $null) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
        Add-Content $OutputFile "##### Fichier : $relativePath"
        Get-Content $file.FullName | Add-Content $OutputFile
    }
}

Write-Host "Le fichier codebase_front.txt a été généré avec succès !" -ForegroundColor Green