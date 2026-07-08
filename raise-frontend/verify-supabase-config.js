/**
 * Supabase Configuration Verification Script
 * 
 * This script helps verify that your Supabase configuration is correct
 * for password reset functionality.
 * 
 * Run with: node verify-supabase-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Supabase Configuration...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('   Please create .env.local file with Supabase credentials.\n');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

// Extract Supabase variables
const config = {};
envLines.forEach(line => {
  const match = line.match(/^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_APP_URL)=(.+)$/);
  if (match) {
    config[match[1]] = match[2].trim();
  }
});

// Verify required variables
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_APP_URL'];
let allPresent = true;

console.log('📋 Environment Variables:');
required.forEach(key => {
  if (config[key]) {
    console.log(`   ✅ ${key}: ${config[key].substring(0, 30)}...`);
  } else {
    console.log(`   ❌ ${key}: MISSING`);
    allPresent = false;
  }
});
console.log('');

if (!allPresent) {
  console.error('❌ Some required environment variables are missing!\n');
  process.exit(1);
}

// Extract project ref from Supabase URL
const urlMatch = config.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!urlMatch) {
  console.error('❌ Invalid Supabase URL format!\n');
  process.exit(1);
}

const projectRef = urlMatch[1];
console.log(`📦 Supabase Project: ${projectRef}`);
console.log('');

// Check supabase.ts configuration
const supabasePath = path.join(__dirname, 'src', 'lib', 'supabase.ts');
if (!fs.existsSync(supabasePath)) {
  console.error('❌ src/lib/supabase.ts not found!\n');
  process.exit(1);
}

const supabaseContent = fs.readFileSync(supabasePath, 'utf8');

console.log('🔧 Supabase Client Configuration:');

// Check for required settings
const checks = [
  { pattern: /detectSessionInUrl:\s*true/, name: 'detectSessionInUrl: true', required: true },
  { pattern: /flowType:\s*['"]pkce['"]/, name: 'flowType: \'pkce\'', required: true },
  { pattern: /persistSession:\s*true/, name: 'persistSession: true', required: true },
  { pattern: /autoRefreshToken:\s*true/, name: 'autoRefreshToken: true', required: false },
];

checks.forEach(check => {
  if (check.pattern.test(supabaseContent)) {
    console.log(`   ✅ ${check.name}`);
  } else if (check.required) {
    console.log(`   ❌ ${check.name} (REQUIRED)`);
    allPresent = false;
  } else {
    console.log(`   ⚠️  ${check.name} (recommended)`);
  }
});
console.log('');

// Check ResetPasswordForm.tsx
const resetFormPath = path.join(__dirname, 'src', 'features', 'auth', 'components', 'ResetPasswordForm.tsx');
if (!fs.existsSync(resetFormPath)) {
  console.error('❌ ResetPasswordForm.tsx not found!\n');
  process.exit(1);
}

const resetFormContent = fs.readFileSync(resetFormPath, 'utf8');

console.log('📝 ResetPasswordForm Component:');

const formChecks = [
  { pattern: /onAuthStateChange/, name: 'Auth state listener', required: true },
  { pattern: /PASSWORD_RECOVERY/, name: 'PASSWORD_RECOVERY event handler', required: true },
  { pattern: /supabase\.auth\.updateUser/, name: 'Password update logic', required: true },
];

formChecks.forEach(check => {
  if (check.pattern.test(resetFormContent)) {
    console.log(`   ✅ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} (REQUIRED)`);
    allPresent = false;
  }
});
console.log('');

// Print next steps
if (allPresent) {
  console.log('✅ All checks passed!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Go to https://app.supabase.com');
  console.log(`   2. Select project: ${projectRef}`);
  console.log('   3. Navigate to: Authentication → URL Configuration');
  console.log('   4. Add these Redirect URLs:');
  console.log(`      - ${config.NEXT_PUBLIC_APP_URL}/auth/reset-password`);
  console.log(`      - ${config.NEXT_PUBLIC_APP_URL}/auth/callback`);
  console.log('   5. Click Save');
  console.log('   6. Test password reset flow\n');
  console.log('📚 For detailed testing instructions, see: PASSWORD_RESET_TESTING.md\n');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}
