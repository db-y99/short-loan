#!/usr/bin/env node

/**
 * Script validate environment variables trước khi deploy
 * Chạy: node scripts/validate-env.js
 */

const requiredEnvVars = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'Supabase project URL',
    example: 'https://xxx.supabase.co',
    required: true,
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase anon key',
    example: 'eyJxxx...',
    required: true,
  },
  'GOOGLE_SERVICE_ACCOUNT_JSON': {
    description: 'Google Service Account JSON',
    example: '{"type":"service_account",...}',
    required: true,
  },
  'SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID': {
    description: 'Google Drive folder ID gốc',
    example: '1abc...xyz',
    required: true,
  },
};

console.log('\n🔍 Validating Environment Variables...\n');

let hasErrors = false;
let hasWarnings = false;

// Check each required variable
for (const [key, config] of Object.entries(requiredEnvVars)) {
  const value = process.env[key];
  
  if (!value) {
    if (config.required) {
      console.log(`❌ ${key}: THIẾU (BẮT BUỘC)`);
      console.log(`   📝 ${config.description}`);
      console.log(`   💡 Ví dụ: ${config.example}\n`);
      hasErrors = true;
    } else {
      console.log(`⚠️  ${key}: Không có (tùy chọn)`);
      console.log(`   📝 ${config.description}\n`);
      hasWarnings = true;
    }
  } else {
    // Validate format
    let isValid = true;
    let warning = null;
    
    if (key === 'GOOGLE_SERVICE_ACCOUNT_JSON') {
      try {
        const parsed = JSON.parse(value);
        if (!parsed.type || !parsed.client_email) {
          warning = 'JSON không đúng format Service Account';
          hasWarnings = true;
        }
      } catch (e) {
        isValid = false;
        warning = 'Không phải JSON hợp lệ';
      }
    }
    
    if (isValid) {
      const displayValue = key.includes('KEY') || key.includes('JSON')
        ? '[***]'
        : value.length > 50
        ? value.substring(0, 47) + '...'
        : value;
      
      console.log(`✅ ${key}: ${displayValue}`);
      if (warning) {
        console.log(`   ⚠️  ${warning}`);
      }
    } else {
      console.log(`❌ ${key}: KHÔNG HỢP LỆ`);
      console.log(`   ⚠️  ${warning}`);
      hasErrors = true;
    }
  }
}

console.log('\n' + '='.repeat(60) + '\n');

if (hasErrors) {
  console.log('❌ CÓ LỖI: Vui lòng fix các biến môi trường bị thiếu hoặc không hợp lệ\n');
  console.log('📚 Xem hướng dẫn:');
  console.log('   - .env.example');
  console.log('   - docs/DEBUG_TAO_HOP_DONG.md');
  console.log('   - DEPLOYMENT_CHECKLIST.md\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  CÓ CẢNH BÁO: Nên kiểm tra lại các biến có warning\n');
  console.log('💡 Tuy nhiên, bạn vẫn có thể tiếp tục deploy\n');
  process.exit(0);
} else {
  console.log('✅ TẤT CẢ BIẾN MÔI TRƯỜNG HỢP LỆ!\n');
  console.log('🚀 Sẵn sàng để deploy\n');
  process.exit(0);
}
