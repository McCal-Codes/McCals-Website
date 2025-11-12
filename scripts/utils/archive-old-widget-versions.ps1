# Widget Version Archival Script
# Automatically archive old widget versions while preserving key milestones

Write-Output "🗂️  Starting Widget Version Archival Process...`n"

# Define widgets to archive with their old versions
$archivalTasks = @(
    @{
        Name = "Event Portfolio"
        Path = "src\widgets\portfolios\event-portfolio\versions"
        KeepVersions = @("v1.0-universal-captions.html", "v2.6.0-lightbox-enhanced.html", "v2.6.2-event-portfolio.html")
    },
    @{
        Name = "Navigation"
        Path = "src\widgets\site\navigation\versions"
        KeepVersions = @("v1.0.0.html", "v1.7.0-enhanced.html", "v1.7.1-rollback.html")
    },
    @{
        Name = "Featured Portfolio"
        Path = "src\widgets\portfolios\featured-portfolio\versions"
        KeepVersions = @("v1.0.html", "v1.4.html", "v1.5-working.html")
    },
    @{
        Name = "Client Carousel"
        Path = "src\widgets\content\about\client-carousel\versions"
        KeepVersions = @("v1.2.0-client-carousel-squarespace.html", "v1.3.0-client-carousel-squarespace.html")
    },
    @{
        Name = "Nature Portfolio"
        Path = "src\widgets\portfolios\nature-portfolio\versions"
        KeepVersions = @("v1.0.html", "v1.7.html", "v1.8-performance-optimized.html")
    },
    @{
        Name = "Footer"
        Path = "src\widgets\site\footer\versions"
        KeepVersions = @("v1.0.0.html", "v1.2.0.html", "v1.3.0-performance-optimized.html")
    }
)

$totalArchived = 0
$totalKept = 0

foreach ($task in $archivalTasks) {
    Write-Output "📁 Processing: $($task.Name)"
    
    $versionsPath = $task.Path
    $archivePath = Join-Path $versionsPath "_archive"
    
    # Create archive folder if it doesn't exist
    if (!(Test-Path $archivePath)) {
        New-Item -ItemType Directory -Force -Path $archivePath | Out-Null
        Write-Output "   ✅ Created archive folder"
    }
    
    # Get all HTML files in versions folder
    $allVersions = Get-ChildItem -Path $versionsPath -Filter "*.html" -File
    
    $archived = 0
    $kept = 0
    
    foreach ($version in $allVersions) {
        if ($task.KeepVersions -contains $version.Name) {
            # Keep this version
            $kept++
            Write-Output "   🟢 KEEP: $($version.Name)"
        } else {
            # Archive this version
            try {
                Move-Item -Path $version.FullName -Destination $archivePath -Force
                $archived++
                Write-Output "   📦 ARCHIVED: $($version.Name)"
            } catch {
                Write-Output "   ⚠️ ERROR archiving: $($version.Name) - $($_.Exception.Message)"
            }
        }
    }
    
    $totalArchived += $archived
    $totalKept += $kept
    
    Write-Output "   📊 Summary: $kept kept, $archived archived`n"
}

Write-Output "`n✅ ARCHIVAL COMPLETE!"
Write-Output "📊 Total Statistics:"
Write-Output "   🟢 Kept: $totalKept versions"
Write-Output "   📦 Archived: $totalArchived versions"
Write-Output "`n💡 Archived files are in 'versions\_archive' folders and can be restored if needed."
