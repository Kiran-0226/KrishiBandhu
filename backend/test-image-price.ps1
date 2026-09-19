$imagePath = "C:\Users\kiran\Downloads\Good.jpeg"

$marketId = "6aad4055a2cf6a3f6d90301b"

Write-Host ""
Write-Host "========================================"
Write-Host " KrishiBandhu Crop Price Test"
Write-Host "========================================"
Write-Host ""
Write-Host "Image : $imagePath"
Write-Host "Market: Pune APMC"
Write-Host ""

if (-not (Test-Path $imagePath)) {
    Write-Host "ERROR: Image file not found." -ForegroundColor Red
    Write-Host "Check the image path:"
    Write-Host $imagePath
    exit 1
}

Write-Host "Reading image..."

$bytes = [System.IO.File]::ReadAllBytes(
    $imagePath
)

$base64 = [System.Convert]::ToBase64String(
    $bytes
)

$extension =
    [System.IO.Path]::GetExtension(
        $imagePath
    ).ToLower()

switch ($extension) {
    ".jpg" {
        $mimeType = "image/jpeg"
    }

    ".jpeg" {
        $mimeType = "image/jpeg"
    }

    ".png" {
        $mimeType = "image/png"
    }

    ".webp" {
        $mimeType = "image/webp"
    }

    default {
        Write-Host "ERROR: Unsupported image format." -ForegroundColor Red
        exit 1
    }
}

$body = @{
    image = $base64
    mimeType = $mimeType
    marketId = $marketId
} | ConvertTo-Json -Depth 5

Write-Host "Sending image to KrishiBandhu..."
Write-Host ""

try {

    $response = Invoke-RestMethod `
        -Uri "http://localhost:5000/api/ai/image/analyze" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "========================================"
    Write-Host " API RESPONSE"
    Write-Host "========================================"
    Write-Host ""

    $response | ConvertTo-Json -Depth 10

    Write-Host ""
    Write-Host "========================================"
    Write-Host " PRICE SUMMARY"
    Write-Host "========================================"
    Write-Host ""

    if ($response.marketData) {

        Write-Host "Crop:"
        Write-Host $response.crop

        Write-Host ""

        Write-Host "Visual Quality:"
        Write-Host "$($response.qualityScore)/10"

        Write-Host ""

        Write-Host "Market:"
        Write-Host $response.marketData.market.name

        Write-Host ""

        Write-Host "Commodity:"
        Write-Host $response.marketData.commodity

        Write-Host ""

        Write-Host "MSAMB Minimum:"
        Write-Host "₹$($response.marketData.minimumPrice)/quintal"

        Write-Host ""

        Write-Host "MSAMB Modal:"
        Write-Host "₹$($response.marketData.modalPrice)/quintal"

        Write-Host ""

        Write-Host "MSAMB Maximum:"
        Write-Host "₹$($response.marketData.maximumPrice)/quintal"

        Write-Host ""

        Write-Host "Indicative Selling Price:"
        Write-Host "₹$($response.marketData.indicativePrice.minimum) - ₹$($response.marketData.indicativePrice.maximum)/quintal"

        Write-Host ""

        Write-Host "Price Date:"
        Write-Host $response.marketData.priceDate

        Write-Host ""

        Write-Host "Source:"
        Write-Host $response.marketData.source

    }
    else {

        Write-Host "No market-price data was returned." -ForegroundColor Yellow

        Write-Host ""
        Write-Host "The crop was probably identified,"
        Write-Host "but no matching commodity/market"
        Write-Host "record was found."

    }

}
catch {

    Write-Host ""
    Write-Host "========================================"
    Write-Host " REQUEST FAILED"
    Write-Host "========================================"
    Write-Host ""

    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host $_.ErrorDetails.Message
    }
}