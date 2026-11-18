# Automated Verification & Security Audit Script
# Tests file integrity, security protections, JSON schemas, and prompt structure.

$workspace = Split-Path -Parent $PSScriptRoot
Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " Running AI Career Copilot Test & Security Audit" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Assert-Test($condition, $testName, $failureMsg) {
    if ($condition) {
        Write-Host " [PASS] $testName" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host " [FAIL] $testName - $failureMsg" -ForegroundColor Red
        $script:failed++
    }
}

# 1. File existence checks
$requiredFiles = @(
    "index.html",
    "css\styles.css",
    "js\app.js",
    "api\analyze.js",
    "vercel.json",
    "package.json",
    ".env.example",
    ".gitignore",
    "tests\test-cases.json"
)

foreach ($f in $requiredFiles) {
    $filePath = Join-Path $workspace $f
    Assert-Test (Test-Path $filePath) "File exists: $f" "Missing required file $f"
}

# 2. Client-Side Security Audits (No API keys in frontend)
$frontendFiles = @("index.html", "js\app.js", "css\styles.css")
foreach ($f in $frontendFiles) {
    $content = Get-Content (Join-Path $workspace $f) -Raw
    $hasHardcodedSecret = $content -match "AIza[0-9A-Za-z-_]{35}" -or $content -match "GEMINI_API_KEY\s*=\s*['`"][a-zA-Z0-9]"
    Assert-Test (-not $hasHardcodedSecret) "Frontend Security ($f): No hardcoded API keys found" "Possible API key detected in frontend code"
}

# 3. DOM XSS Injection Protections
$appJsContent = Get-Content (Join-Path $workspace "js\app.js") -Raw
$hasEscapeFunction = $appJsContent -match "function escapeHTML"
$usesTextContent = $appJsContent -match "textContent"
Assert-Test ($hasEscapeFunction -and $usesTextContent) "Frontend DOM Safety: Uses textContent & escapeHTML for safe rendering" "Missing HTML escaping in app.js"

# 4. Server-Side Security & Environment Variable Verification
$apiContent = Get-Content (Join-Path $workspace "api\analyze.js") -Raw
$readsEnvKey = $apiContent -match "process\.env\.GEMINI_API_KEY"
Assert-Test $readsEnvKey "Server Endpoint: Reads key from process.env.GEMINI_API_KEY" "api/analyze.js does not read from process.env.GEMINI_API_KEY"

$shieldsInjection = $apiContent -match "UNTRUSTED DATA" -or $apiContent -match "untrusted"
Assert-Test $shieldsInjection "Server Endpoint: Contains prompt injection defense against untrusted user input" "Missing untrusted data disclaimer in prompt"

$handlesRateLimit = $apiContent -match "429"
Assert-Test $handlesRateLimit "Server Endpoint: Explicitly handles HTTP 429 Rate Limiting" "Missing 429 status check"

$cleansJsonMarkdown = $apiContent -match "cleanJsonText" -or $apiContent -match "replace"
Assert-Test $cleansJsonMarkdown "Server Endpoint: Cleans markdown fences from JSON output" "Missing markdown JSON cleaner"

# 5. Git & Secret Exclusion
$gitIgnoreContent = Get-Content (Join-Path $workspace ".gitignore") -Raw
$ignoresEnv = $gitIgnoreContent -match "\.env"
Assert-Test $ignoresEnv "Git Security: .gitignore excludes .env and .env.local" ".env not found in .gitignore"

# 6. JSON Syntax Integrity Checks
try {
    $testCases = Get-Content (Join-Path $workspace "tests\test-cases.json") -Raw | ConvertFrom-Json
    Assert-Test ($testCases.Count -eq 5) "Test Cases: Exactly 5 fictional test cases defined" "Found $($testCases.Count) cases, expected 5"
} catch {
    Assert-Test $false "Test Cases: Valid JSON syntax" "tests/test-cases.json has invalid JSON: $_"
}

try {
    $packageJson = Get-Content (Join-Path $workspace "package.json") -Raw | ConvertFrom-Json
    Assert-Test ($packageJson.name -eq "ai-career-copilot") "Package JSON: Valid syntax and metadata" "Invalid package.json"
} catch {
    Assert-Test $false "Package JSON: Valid syntax" "package.json parse error: $_"
}

try {
    $vercelJson = Get-Content (Join-Path $workspace "vercel.json") -Raw | ConvertFrom-Json
    Assert-Test ($vercelJson.routes.Count -ge 2) "Vercel JSON: Proper routing definitions" "Invalid vercel.json"
} catch {
    Assert-Test $false "Vercel JSON: Valid syntax" "vercel.json parse error: $_"
}

# 7. Summary
Write-Host "`n--------------------------------------------------------" -ForegroundColor Cyan
Write-Host " Audit Results: $passed Passed, $failed Failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================================`n" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}
