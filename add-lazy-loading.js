const fs = require('fs');

const filePath = 'reader.html';
let content = fs.readFileSync(filePath, 'utf8');

// Add loading="lazy" to all img tags that don't already have it
content = content.replace(/<img([^>]*?)(?:\s+loading=["'][^"']*["'])?([^>]*?)>/gi, (match, beforeLoading, afterLoading) => {
  // Check if loading attribute already exists
  if (beforeLoading.includes('loading=')) {
    return match;
  }
  // Add loading="lazy" before the closing >
  return `<img${beforeLoading} loading="lazy"${afterLoading}>`;
});

fs.writeFileSync(filePath, content);
console.log('Added loading="lazy" to all img tags in reader.html');
