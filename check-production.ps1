# Quick Production Check Script
# Run this on your production server to verify everything is working

Write-Host "=== PAW-PK Production Health Check ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://api.thepawinternational.com/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend is healthy" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Products API
Write-Host "2. Testing Products API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://api.thepawinternational.com/api/products" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $products = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ Products API working - Found $($products.Count) products" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Products API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Frontend
Write-Host "3. Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://thepawinternational.com" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is accessible" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Frontend check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: CORS Headers
Write-Host "4. Testing CORS Configuration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://api.thepawinternational.com/api/health" -Method Options -Headers @{
        "Origin" = "https://thepawinternational.com"
        "Access-Control-Request-Method" = "GET"
    } -UseBasicParsing
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "   ✅ CORS is configured" -ForegroundColor Green
        Write-Host "   Allowed Origin: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  CORS headers not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ CORS check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Health Check Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed testing, open: test-production.html in your browser" -ForegroundColor Gray
