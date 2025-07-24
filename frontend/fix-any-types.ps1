#!/usr/bin/env pwsh

# Script to fix remaining 'any' type issues in the React app

Write-Host "Fixing remaining 'any' type issues..." -ForegroundColor Green

$rootPath = "src"

# Fix common state patterns
Write-Host "Fixing state patterns..." -ForegroundColor Yellow
Get-ChildItem -Path $rootPath -Include "*.tsx","*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Fix common state patterns
    $content = $content -replace "useState<any>\(null\)", "useState<unknown>(null)"
    $content = $content -replace "useState<any\[\]>\(\[\]\)", "useState<unknown[]>([])"
    $content = $content -replace "catch \(error: any\)", "catch (error: unknown)"
    $content = $content -replace "catch \(err: any\)", "catch (err: unknown)"
    
    # Fix parameter types
    $content = $content -replace "\(resident: any\)", "(resident: unknown)"
    $content = $content -replace "\(user: any\)", "(user: unknown)"
    $content = $content -replace "\(household: any\)", "(household: unknown)"
    $content = $content -replace "\(project: any\)", "(project: unknown)"
    $content = $content -replace "\(official: any\)", "(official: unknown)"
    $content = $content -replace "\(item: any\)", "(item: unknown)"
    
    Set-Content -Path $_.FullName -Value $content
}

Write-Host "Fixed common patterns. Run 'npm run lint' to check remaining issues." -ForegroundColor Green
