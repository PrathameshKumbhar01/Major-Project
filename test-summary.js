const response = await fetch('http://localhost:5000/api/study-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    messages: [{ role: 'user', content: 'Summarize these study notes from "test.txt" for exam revision:\n\nBinary trees are hierarchical data structures...' }],
    mode: 'summary'
  })
});
const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);