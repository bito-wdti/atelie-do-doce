const fs = require('fs');
const path = require('path');

const fixFile = (p) => {
  let content = fs.readFileSync(p, 'utf8');

  // Fix generic pink colors
  content = content.replace(/\bbg-pink-50\b/g, 'bg-indigo-50/50');
  content = content.replace(/\bbg-pink-100\b/g, 'bg-indigo-100/50');
  content = content.replace(/\bbg-pink-500\b/g, 'bg-primary');
  content = content.replace(/\btext-pink-500\b/g, 'text-primary');
  content = content.replace(/\btext-pink-600\b/g, 'text-primary');
  content = content.replace(/\bshadow-pink-50\b/g, 'shadow-indigo-50/50');

  // Reduce text thickness
  content = content.replace(/\bfont-bold\b/g, 'font-semibold');
  
  // Remove uppercase tracking
  content = content.replace(/\buppercase\b/g, '');
  
  // They also complained about the title having "font-display text-gray-900 font-bold R$28.99".
  // font-display + font-semibold might still be too thick. Let's make sure it's not overly thick.
  // Actually, keeping font-display is fine if we remove font-bold. I replaced font-bold with font-semibold.

  fs.writeFileSync(p, content);
  console.log('Fixed:', p);
};

const dir = path.join(__dirname, 'pages');
const files = fs.readdirSync(dir).filter(f => f.startsWith('Admin') && f.endsWith('.tsx'));
files.forEach(f => fixFile(path.join(dir, f)));

// Don't forget App.tsx
fixFile(path.join(__dirname, 'App.tsx'));
