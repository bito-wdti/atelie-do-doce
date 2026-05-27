const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'pages');

const files = fs.readdirSync(dir).filter(f => f.startsWith('Admin') && f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');

  // Fix tailwind classes that were broken
  content = content.replace(/\[primary\]/g, 'primary');
  content = content.replace(/\[primary\/80\]/g, 'primary/80');
  content = content.replace(/border border-gray-100 border-gray-200/g, 'border border-gray-200');
  content = content.replace(/shadow-primary\/100/g, 'shadow-primary/30');

  // Inject font-display into headings
  content = content.replace(/<(h1|h2|h3)([^>]*)className="([^"]*)"/g, (match, tag, rest, className) => {
    if (!className.includes('font-display')) {
      return `<${tag}${rest}className="${className} font-display"`;
    }
    return match;
  });

  // Add more specific standardizations like border color and rounded classes for other missing pieces if any
  content = content.replace(/rounded-lg/g, 'rounded-xl');
  content = content.replace(/rounded-md/g, 'rounded-lg');
  
  fs.writeFileSync(p, content);
  console.log(`Updated ${f}`);
});
