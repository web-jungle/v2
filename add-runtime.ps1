$files = Get-ChildItem -Path "app" -Filter "route.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $runtimeLine = "export const runtime = 'nodejs';"
    $hasRuntime = $false
    
    # Vérifier si la ligne existe déjà
    foreach ($line in $content) {
        if ($line -match "export const runtime") {
            $hasRuntime = $true
            break
        }
    }
    
    # Si la directive n'existe pas, l'ajouter après les imports
    if (-not $hasRuntime) {
        $newContent = @()
        $importsDone = $false
        $addedRuntime = $false
        
        foreach ($line in $content) {
            $newContent += $line
            
            # Ajouter après la dernière ligne d'import
            if ($line -match "import .* from" -and -not $line.Trim().StartsWith("//")) {
                $importsDone = $true
            } elseif ($importsDone -and -not $addedRuntime -and -not ($line -match "import .* from") -and $line.Trim() -eq "") {
                $newContent += $runtimeLine
                $addedRuntime = $true
            }
        }
        
        # Si on n'a pas réussi à l'ajouter après les imports, l'ajouter au début
        if (-not $addedRuntime) {
            $newContent = @($content[0], "", $runtimeLine) + $content[1..($content.Length-1)]
        }
        
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Added runtime to $($file.FullName)"
    } else {
        Write-Host "Runtime already exists in $($file.FullName)"
    }
} 