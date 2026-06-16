$ErrorActionPreference = "Stop"

function Get-EnvMap {
  param(
    [string]$Path
  )

  $map = @{}
  Get-Content $Path | ForEach-Object {
    if ([string]::IsNullOrWhiteSpace($_) -or $_.StartsWith("#")) {
      return
    }

    $parts = $_ -split "=", 2
    if ($parts.Length -eq 2) {
      $map[$parts[0].Trim()] = $parts[1].Trim()
    }
  }

  return $map
}

$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
  throw ".env file not found at $envFile"
}

$envMap = Get-EnvMap -Path $envFile
$supabaseUrl = $envMap["NEXT_PUBLIC_SUPABASE_URL"]
$dbPassword = $envMap["SUPABASE_DATABASE_PASSWORD"]

if (-not $supabaseUrl) {
  throw "NEXT_PUBLIC_SUPABASE_URL is missing in .env"
}

if (-not $dbPassword) {
  throw "SUPABASE_DATABASE_PASSWORD is missing in .env"
}

$projectRef = [regex]::Match($supabaseUrl, "https://([^.]+)\.supabase\.co").Groups[1].Value
if (-not $projectRef) {
  throw "Could not extract Supabase project ref from NEXT_PUBLIC_SUPABASE_URL"
}

Write-Host "Linking Supabase project $projectRef..."
npx supabase link --project-ref $projectRef --password $dbPassword
if ($LASTEXITCODE -ne 0) {
  throw "supabase link failed"
}

Write-Host "Pushing migrations..."
npx supabase db push --linked --include-all --yes
if ($LASTEXITCODE -ne 0) {
  throw "supabase db push failed"
}

Write-Host "Supabase schema setup complete."
