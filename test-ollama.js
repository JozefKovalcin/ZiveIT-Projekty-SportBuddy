// Test skript pre overenie Ollama integrácie
const fetch = require('node-fetch');

async function testOllama() {
  console.log('🧪 Testujem Ollama integráciu...\n');

  // Test 1: Overenie Ollama servera
  console.log('1️⃣ Kontrolujem Ollama server...');
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    console.log('✅ Ollama server beží');
    console.log('📦 Dostupné modely:', data.models.map(m => m.name).join(', '));
  } catch (error) {
    console.error('❌ Ollama server nebeží:', error.message);
    return;
  }

  // Test 2: Overenie OpenAI-kompatibilného API
  console.log('\n2️⃣ Testujem OpenAI-kompatibilné API...');
  try {
    const response = await fetch('http://localhost:11434/v1/models');
    const data = await response.json();
    console.log('✅ OpenAI API endpoint funguje');
    console.log('📦 Modely cez OpenAI API:', data.data.map(m => m.id).join(', '));
  } catch (error) {
    console.error('❌ OpenAI API endpoint nefunguje:', error.message);
    return;
  }

  // Test 3: Test AI search endpointu
  console.log('\n3️⃣ Testujem AI search endpoint...');
  try {
    const response = await fetch('http://localhost:3001/api/ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'futbal v Košiciach zajtra'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ AI search funguje!');
      console.log('🔍 Výsledok:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ AI search zlyhal:', data);
    }
  } catch (error) {
    console.error('❌ Chyba pri volaní AI search:', error.message);
  }

  console.log('\n✨ Test dokončený!');
}

testOllama();
