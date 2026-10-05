Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\patel\Downloads\folk_app\public\assets\images\folk_logo.png"
$resDir  = "c:\Users\patel\Downloads\folk_app\android\app\src\main\res"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source logo not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)

function Resize-Image {
    param(
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height,
        [string]$DestPath,
        [bool]$PadAdaptive = $false
    )

    $destBmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    if ($PadAdaptive) {
        # For foreground in adaptive icon, the logo should take up ~66% of the viewport (safe zone)
        $logoSize = [int]($Width * 0.68)
        $offset = [int](($Width - $logoSize) / 2)
        $g.DrawImage($Image, $offset, $offset, $logoSize, $logoSize)
    } else {
        $g.DrawImage($Image, 0, 0, $Width, $Height)
    }

    $g.Dispose()

    $destDir = [System.IO.Path]::GetDirectoryName($DestPath)
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    if (Test-Path $DestPath) {
        Remove-Item $DestPath -Force
    }

    $destBmp.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
    Write-Host "Created: $DestPath ($Width x $Height)"
}

# Icon dimensions: [folder, launcherSize, foregroundSize]
$mipmapSpecs = @(
    @{ Folder = "mipmap-mdpi";    Size = 48;  FgSize = 108 },
    @{ Folder = "mipmap-hdpi";    Size = 72;  FgSize = 162 },
    @{ Folder = "mipmap-xhdpi";   Size = 96;  FgSize = 216 },
    @{ Folder = "mipmap-xxhdpi";  Size = 144; FgSize = 324 },
    @{ Folder = "mipmap-xxxhdpi"; Size = 192; FgSize = 432 }
)

foreach ($spec in $mipmapSpecs) {
    $targetDir = Join-Path $resDir $spec.Folder
    
    # 1. Standard launcher icon
    $launcherPath = Join-Path $targetDir "ic_launcher.png"
    Resize-Image -Image $srcImg -Width $spec.Size -Height $spec.Size -DestPath $launcherPath -PadAdaptive $false

    # 2. Round launcher icon
    $roundPath = Join-Path $targetDir "ic_launcher_round.png"
    Resize-Image -Image $srcImg -Width $spec.Size -Height $spec.Size -DestPath $roundPath -PadAdaptive $false

    # 3. Adaptive foreground icon (centered with safe zone margin)
    $fgPath = Join-Path $targetDir "ic_launcher_foreground.png"
    Resize-Image -Image $srcImg -Width $spec.FgSize -Height $spec.FgSize -DestPath $fgPath -PadAdaptive $true
}

# Splash screen generations
function Create-Splash {
    param(
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height,
        [string]$DestPath
    )
    $destBmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    # Warm clean ivory background #F8F6F0
    $bgColor = [System.Drawing.Color]::FromArgb(248, 246, 240)
    $g.Clear($bgColor)

    $logoSize = [int]([Math]::Min($Width, $Height) * 0.45)
    $offsetX = [int](($Width - $logoSize) / 2)
    $offsetY = [int](($Height - $logoSize) / 2)
    $g.DrawImage($Image, $offsetX, $offsetY, $logoSize, $logoSize)
    $g.Dispose()

    if (Test-Path $DestPath) { Remove-Item $DestPath -Force }
    $destBmp.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
    Write-Host "Created Splash: $DestPath ($Width x $Height)"
}

$splashSpecs = @(
    @{ Folder = "drawable";             W = 480;  H = 800 },
    @{ Folder = "drawable-port-mdpi";    W = 320;  H = 480 },
    @{ Folder = "drawable-port-hdpi";    W = 480;  H = 800 },
    @{ Folder = "drawable-port-xhdpi";   W = 720;  H = 1280 },
    @{ Folder = "drawable-port-xxhdpi";  W = 960;  H = 1600 },
    @{ Folder = "drawable-port-xxxhdpi"; W = 1280; H = 1920 },
    @{ Folder = "drawable-land-mdpi";    W = 480;  H = 320 },
    @{ Folder = "drawable-land-hdpi";    W = 800;  H = 480 },
    @{ Folder = "drawable-land-xhdpi";   W = 1280; H = 720 },
    @{ Folder = "drawable-land-xxhdpi";  W = 1600; H = 960 },
    @{ Folder = "drawable-land-xxxhdpi"; W = 1920; H = 1280 }
)

foreach ($s in $splashSpecs) {
    $dir = Join-Path $resDir $s.Folder
    if (Test-Path $dir) {
        $p = Join-Path $dir "splash.png"
        Create-Splash -Image $srcImg -Width $s.W -Height $s.H -DestPath $p
    }
}

$srcImg.Dispose()
Write-Host "Android app launcher icons and splash screens successfully generated!"
