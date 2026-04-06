# Script to rename long portfolio folders for Vercel build
# Run from repo root: .\fix-long-paths.ps1

$ErrorActionPreference = "Continue"

Write-Host "Finding and renaming long paths..." -ForegroundColor Green

# Define rename mappings for long folder names
$renames = @{
    # src/images/Portfolios/Journalism/Politics folders
    "src/images/Portfolios/Journalism/Politics/Kamala in Pittsburgh amid Election Eve" = "src/images/Portfolios/Journalism/Politics/kamala-pitt-nov24"
    "src/images/Portfolios/Journalism/Politics/Scarlett Johansson Canvas Launch" = "src/images/Portfolios/Journalism/Politics/scarlett-canvas-nov24"
    "src/images/Portfolios/Journalism/Politics/Clinton Speaks at Pitt Greensburgh" = "src/images/Portfolios/Journalism/Politics/clinton-pitt-greensburgh"
    "src/images/Portfolios/Journalism/Politics/JD Vance in Johnstown" = "src/images/Portfolios/Journalism/Politics/jdvance-johnstown"
    "src/images/Portfolios/Journalism/Politics/Kamala Arrives Johnstown" = "src/images/Portfolios/Journalism/Politics/kamala-arrives-johnstown"
    "src/images/Portfolios/Journalism/Politics/Kamala Harris Erie" = "src/images/Portfolios/Journalism/Politics/kamala-erie"
    "src/images/Portfolios/Journalism/Politics/Kamala Speaks at Erie" = "src/images/Portfolios/Journalism/Politics/kamala-speaks-erie"
    "src/images/Portfolios/Journalism/Politics/Obama Speaks at Pitt" = "src/images/Portfolios/Journalism/Politics/obama-speaks-pitt"
    "src/images/Portfolios/Journalism/Politics/Obama in Pittsburgh" = "src/images/Portfolios/Journalism/Politics/obama-pittsburgh"
    "src/images/Portfolios/Journalism/Politics/Tim Waltz Erie" = "src/images/Portfolios/Journalism/Politics/timwaltz-erie"
    "src/images/Portfolios/Journalism/Politics/Trump Rally Erie" = "src/images/Portfolios/Journalism/Politics/trump-rally-erie"
    "src/images/Portfolios/Journalism/Politics/Trump Returns to Butler" = "src/images/Portfolios/Journalism/Politics/trump-returns-butler"
    "src/images/Portfolios/Journalism/Politics/VP Debate Watch Party" = "src/images/Portfolios/Journalism/Politics/vp-debate-party"
    "src/images/Portfolios/Journalism/Politics/Globe Political Coverage" = "src/images/Portfolios/Journalism/Politics/globe-political-coverage"
    "src/images/Portfolios/Journalism/Politics/JD Vance Johnstown" = "src/images/Portfolios/Journalism/Politics/jdvance-johnstown-2"
    "src/images/Portfolios/Journalism/Politics/Butler Protest" = "src/images/Portfolios/Journalism/Politics/butler-protest"
    "src/images/Portfolios/Journalism/Politics/CMU Trump Protest" = "src/images/Portfolios/Journalism/Politics/cmu-trump-protest"
    "src/images/Portfolios/Journalism/Politics/Pitt Palestine Protest" = "src/images/Portfolios/Journalism/Politics/pitt-palestine-protest"
}

$changes = @()

foreach ($oldPath in $renames.Keys) {
    $newPath = $renames[$oldPath]
    
    if (Test-Path $oldPath -PathType Container) {
        if (Test-Path $newPath) {
            Write-Host "SKIPPED: $newPath already exists" -ForegroundColor Yellow
        } else {
            try {
                git mv "$oldPath" "$newPath" 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "RENAMED: $oldPath -> $newPath" -ForegroundColor Green
                    $changes += $oldPath
                } else {
                    # Try regular rename if git mv failed
                    Rename-Item -Path $oldPath -NewPath $newPath -Force
                    git add "$newPath"
                    Write-Host "RENAMED (fallback): $oldPath -> $newPath" -ForegroundColor Cyan
                    $changes += $oldPath
                }
            } catch {
                Write-Host "ERROR: Failed to rename $oldPath" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "NOT FOUND: $oldPath" -ForegroundColor DarkGray
    }
}

# Also remove any cached old paths from git
Write-Host "`nCleaning git cache for old paths..." -ForegroundColor Yellow
$longPaths = git ls-files | Where-Object { $_.Length -gt 90 }
foreach ($path in $longPaths) {
    if (Test-Path $path -PathType Leaf) {
        # File still exists with long path, need to handle it
        Write-Host "Found long file path: $path" -ForegroundColor Magenta
    }
}

Write-Host "`nDone! Check git status and commit changes." -ForegroundColor Green
git status --short
