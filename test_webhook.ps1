$payload = @{
    type = "payment"
    id = "123"
    status = "approved"
    payer = @{
        email = "perpettumclub@gmail.com"
        first_name = "Felipe"
        last_name = "Vidal"
    }
    email = "perpettumclub@gmail.com"
} | ConvertTo-Json -Depth 3

# ATENÇÃO: Se tentar rodar sem a x-signature gerada criptograficamente, 
# a requisição passará a retornar "🚨 Invalid Webhook Signature detected (401)"
# graças à proteção inserida.

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9laXF6c2hrcW5qYmx2aXZtdWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTI3MjIsImV4cCI6MjA3NTU4ODcyMn0.nfnzBHWhYCgpH5XRmxORPsbkLmjRtdv7KQmtsUVsyek"
}

try {
    # Estamos mandando os params da querystring simulando Mercado Pago
    $response = Invoke-RestMethod -Uri "https://oeiqzshkqnjblvivmuih.supabase.co/functions/v1/mercadopago-webhook?topic=payment&id=123" -Method Post -Headers $headers -Body $payload
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
