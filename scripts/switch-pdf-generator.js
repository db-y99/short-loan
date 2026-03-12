/**
 * Script để switch giữa các PDF generators
 * Usage: node scripts/switch-pdf-generator.js [local|service|gas]
 */

const fs = require('fs');
const path = require('path');

const generators = {
  local: {
    name: 'Local Puppeteer',
    import: '@/lib/pdf-generator',
    description: 'Puppeteer chạy trực tiếp trong Next.js (có thể gây memory leak)'
  },
  service: {
    name: 'PDF Service',
    import: '@/lib/pdf-generator',
    description: 'PDF microservice riêng (cần chạy pdf-service)'
  },
  gas: {
    name: 'Google Apps Script',
    import: '@/lib/pdf-generator-app-scripts',
    description: 'Google Apps Script (miễn phí, setup đơn giản)'
  }
};

function updateContractsService(generatorType) {
  const filePath = path.join(process.cwd(), 'services/contracts/contracts.service.ts');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    process.exit(1);
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  const generator = generators[generatorType];
  if (!generator) {
    console.error('❌ Invalid generator type. Use: local, service, or gas');
    process.exit(1);
  }
  
  // Update import statement
  const importRegex = /const \{ generateContractPDF \} = await import\("([^"]+)"\);/;
  const newImport = `const { generateContractPDF } = await import("${generator.import}");`;
  
  if (importRegex.test(content)) {
    content = content.replace(importRegex, newImport);
  } else {
    console.error('❌ Could not find import statement to replace');
    process.exit(1);
  }
  
  // Update comment
  const commentRegex = /\/\*\*\s*\n\s*\* Generate PDF buffer từ contract data - [^\n]+\n\s*\*\//;
  const newComment = `/**\n * Generate PDF buffer từ contract data - ${generator.name.toUpperCase()}\n */`;
  
  if (commentRegex.test(content)) {
    content = content.replace(commentRegex, newComment);
  }
  
  // Write back to file
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`✅ Switched to: ${generator.name}`);
  console.log(`📝 Description: ${generator.description}`);
  console.log(`📁 Import: ${generator.import}`);
  
  // Show additional setup instructions
  if (generatorType === 'service') {
    console.log('\n📋 Next steps:');
    console.log('1. cd pdf-service');
    console.log('2. npm install');
    console.log('3. npm run dev');
    console.log('4. Make sure PDF_SERVICE_URL=http://localhost:3001 in .env.local');
  } else if (generatorType === 'gas') {
    console.log('\n📋 Next steps:');
    console.log('1. Setup Google Apps Script (see docs/GOOGLE_APPS_SCRIPT_SETUP.md)');
    console.log('2. Update PDF_SERVICE_URL in .env.local with your Google Apps Script URL');
    console.log('3. Test with: node scripts/test-gas-pdf.js');
    console.log('\n💡 Current PDF_SERVICE_URL:', process.env.PDF_SERVICE_URL || 'Not set');
  } else if (generatorType === 'local') {
    console.log('\n⚠️  Warning: Local Puppeteer may cause memory issues in production');
    console.log('📋 Make sure you have puppeteer installed: npm install puppeteer');
  }
}

// Main
const generatorType = process.argv[2];

if (!generatorType) {
  console.log('🔄 PDF Generator Switcher\n');
  console.log('Usage: node scripts/switch-pdf-generator.js [type]\n');
  console.log('Available types:');
  Object.entries(generators).forEach(([key, gen]) => {
    console.log(`  ${key.padEnd(8)} - ${gen.name} (${gen.description})`);
  });
  console.log('\nExample: node scripts/switch-pdf-generator.js gas');
  process.exit(0);
}

updateContractsService(generatorType);