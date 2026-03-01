import fs from 'fs';
import path from 'path';

console.log("Starting completion check...");

// Manually read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/VITE_OPENAI_API_KEY=(.+)/);
    if (match) {
        apiKey = match[1].trim();
    }
}

if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

const url = "https://api.openai.com/v1/chat/completions";
const body = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Say hello!" }],
    max_tokens: 5
};

console.log(`Testing completion with ${body.model}...`);

try {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    console.log("Response status:", response.status);

    if (response.status === 429) {
        console.error("ERROR: Rate Limited (429).");
    } else if (!response.ok) {
        const text = await response.text();
        console.error("ERROR:", text);
    } else {
        const data = await response.json();
        console.log("SUCCESS:", data.choices[0].message.content);
    }
} catch (error) {
    console.error("Network error:", error.message);
}
