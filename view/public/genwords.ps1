# WordNet dict path
$DictPath = "C:\Program Files (x86)\WordNet\2.1\dict"

# Output file
$OutputFile = Join-Path (Get-Location) "common_words.txt"

function Get-TopWNWords {
    param (
        [string]$IndexFile,
        [int]$Limit = 500
    )

    $wordList = @()

    Get-Content $IndexFile | ForEach-Object {
        $line = $_.Trim()
        if ([string]::IsNullOrWhiteSpace($line)) { return }    # skip empty lines
        if ($line.StartsWith(";")) { return }                  # skip comments

        $cols = $line -split "\s+"
        if ($cols.Length -lt 6) { return }                     # skip malformed lines

        $word = $cols[0]

        # Skip multi-word entries
        if ($word -match "[-_]") { return }

        # Parse p_cnt safely
        $p_cnt = 0
        [int]::TryParse($cols[3], [ref]$p_cnt) | Out-Null

        # Calculate index of tagsense_cnt: 4 + p_cnt + 1 - 1 (0-based)
        $tagsenseIndex = 4 + $p_cnt
        if ($tagsenseIndex -ge $cols.Length) { $tagsenseIndex = $cols.Length - 1 }

        # Parse tagsense_cnt safely
        $tagsense = 0
        [int]::TryParse($cols[$tagsenseIndex], [ref]$tagsense) | Out-Null

        # Add to list
        $wordList += [PSCustomObject]@{
            Word = $word
            Freq = $tagsense
        }
    }

    # Sort descending by frequency and take top $Limit
    $topWords = $wordList | Sort-Object -Property Freq -Descending | Select-Object -First $Limit
    return $topWords.Word
}

# Index files
$NounIndex = Join-Path $DictPath "index.noun"
$VerbIndex = Join-Path $DictPath "index.verb"

# Check if files exist
if (-not (Test-Path $NounIndex)) { Write-Error "$NounIndex not found"; exit }
if (-not (Test-Path $VerbIndex)) { Write-Error "$VerbIndex not found"; exit }

# Get top 500 nouns and verbs
$nouns = Get-TopWNWords -IndexFile $NounIndex -Limit 500
$verbs = Get-TopWNWords -IndexFile $VerbIndex -Limit 500

# Combine and save
$allWords = $nouns + $verbs
$allWords | Set-Content -Path $OutputFile -Encoding UTF8

Write-Output "Saved $($allWords.Count) words to $OutputFile"
