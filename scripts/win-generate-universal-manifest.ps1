param(
  [string]$Root = ".\src\images\Portfolios",
  [string]$Out = ".\src\images\Portfolios\portfolio-manifest.json"
)

Write-Host "Generating universal manifest..."
node .\scripts\generate-universal-manifest.js --root "$Root" --out "$Out"
Write-Host "Done -> $Out"
