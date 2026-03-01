$payload = @{
    type = "payment"
    status = "approved"
    payer = @{
        email = "perpettumclub@gmail.com"
        first_name = "Felipe"
        last_name = "Vidal"
    }
    email = "perpettumclub@gmail.com"
} | ConvertTo-Json -Depth 3

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9laXF6c2hrcW5qYmx2aXZtdWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTI3MjIsImV4cCI6MjA3NTU4ODcyMn0.nfnzBHWhYCgpH5XRmxORPsbkLmjRtdv7KQmtsUVsyek"
}

try {
    $response = Invoke-RestMethod -Uri "https://oeiqzshkqnjblvivmuih.supabase.co/functions/v1/mercadopago-webhook" -Method Post -Headers $headers -Body $payload
    Write-Host "Success! Response:"
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Response Body: $body"
    }
}
