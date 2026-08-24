# Mints an HS256 JWT for testing the admin contact-message endpoints.
#
# There is no login endpoint yet — JwtTokenProvider.generateToken exists but is not
# exposed over HTTP, pending the shared auth module. Until that lands, admin routes
# are tested with a hand-minted token whose shape matches what JwtAuthenticationFilter
# expects: subject in "sub", plain role names in a "roles" array.
#
# Roles must be UNPREFIXED. JwtTokenProvider.getAuthorities prepends "ROLE_", so a
# claim of ROLE_ADMIN becomes ROLE_ROLE_ADMIN and every @PreAuthorize check 403s.
#
# Reads JWT_SECRET from the environment — run scripts\run-dev.ps1 first, or set it
# yourself. It must be the same secret the running backend booted with.
#
# Usage:
#   $TOKEN = .\scripts\make-token.ps1                  # ADMIN, 24h
#   $TOKEN = .\scripts\make-token.ps1 CONTENT_ADMIN    # other role
#   $TOKEN = .\scripts\make-token.ps1 STUDENT          # to verify 403s

param(
    [string]$Role    = "ADMIN",
    [string]$Subject = "admin@lesuccess.in"
)

$ErrorActionPreference = "Stop"

$secret = $env:JWT_SECRET
if (-not $secret) {
    throw "JWT_SECRET is not set in this shell. Run scripts\run-dev.ps1 first, or set it manually."
}
if ($secret.Length -lt 32) {
    throw "JWT_SECRET is $($secret.Length) chars. Keys.hmacShaKeyFor rejects anything under 256 bits."
}

function ConvertTo-B64Url([byte[]]$bytes) {
    [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$exp = $now + 86400   # matches lesuccess.jwt.expiration-ms default

$header  = '{"alg":"HS256","typ":"JWT"}'
$payload = "{""sub"":""$Subject"",""roles"":[""$Role""],""iat"":$now,""exp"":$exp}"

$h = ConvertTo-B64Url ([Text.Encoding]::UTF8.GetBytes($header))
$p = ConvertTo-B64Url ([Text.Encoding]::UTF8.GetBytes($payload))
$signingInput = "$h.$p"

$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [Text.Encoding]::UTF8.GetBytes($secret)
$sig = ConvertTo-B64Url ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($signingInput)))

Write-Output "$signingInput.$sig"
