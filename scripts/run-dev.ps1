# Boots the backend locally on the 'dev' profile.
#
# Why this script exists: nothing in the stack reads .env on its own. There is no
# dotenv dependency in the pom and no spring.config.import, so JWT_SECRET,
# DB_USERNAME and DB_PASSWORD have to be real process environment variables or the
# context fails to refresh with "Could not resolve placeholder 'JWT_SECRET'".
# The dev profile also has to be named explicitly — spring.datasource.url lives
# only in application-dev.yml, so a default-profile boot has no database at all.
#
# Usage (from anywhere):  .\scripts\run-dev.ps1

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile  = Join-Path $repoRoot ".env"

if (-not (Test-Path $envFile)) {
    throw "No .env found at $envFile. Copy .env.example to .env and fill it in."
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }

    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }

    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()

    # Skip blanks rather than exporting an empty string: an empty JWT_SECRET
    # resolves the placeholder and then fails deeper in Keys.hmacShaKeyFor,
    # which is a much less obvious error than the missing-placeholder one.
    if ($val -eq "") { return }

    Set-Item -Path "Env:$key" -Value $val
    Write-Host "  set $key" -ForegroundColor DarkGray
}

if (-not $env:JWT_SECRET) {
    throw "JWT_SECRET is empty or absent in .env. Generate one with: openssl rand -base64 48"
}
if ($env:JWT_SECRET.Length -lt 32) {
    throw "JWT_SECRET is $($env:JWT_SECRET.Length) chars. HS256 needs at least 32."
}

Write-Host "`nBooting on profile 'dev' -> http://localhost:8080`n" -ForegroundColor Cyan

Push-Location (Join-Path $repoRoot "backend")
try {
    & .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
} finally {
    Pop-Location
}
