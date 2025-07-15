/**
 * Phase 2 Implementation Test
 * 
 * This file tests the basic AI processing pipeline components
 * to ensure they're properly configured before starting the worker.
 * 
 * Run: npm run test:phase2
 */

const fs = require('fs');
const path = require('path');

async function testPhase2Setup() {
  console.log('🧪 Testing Phase 2: AI Video Processing Setup\n');
  
  const tests = [];
  
  // Test 1: OpenAI Configuration
  try {
    console.log('1. Testing OpenAI Configuration...');
    
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('   ⚠️  OPENAI_API_KEY not found in .env.local');
      console.log('   💡 Add your OpenAI API key to enable AI features');
      tests.push(false);
    } else if (process.env.OPENAI_API_KEY === '') {
      console.log('   ⚠️  OPENAI_API_KEY is empty in .env.local');
      console.log('   💡 Add your OpenAI API key to enable AI features');
      tests.push(false);
    } else {
      console.log('   ✅ OpenAI API key configured');
      tests.push(true);
    }
  } catch (error) {
    console.log(`   ❌ OpenAI configuration error: ${error.message}`);
    tests.push(false);
  }
  
  // Test 2: Redis Connection
  try {
    console.log('\n2. Testing Redis Connection...');
    const Redis = require('ioredis');
    
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 1,
      retryDelayOnFailover: 100,
    });
    
    await redis.ping();
    console.log('   ✅ Redis connection successful');
    await redis.disconnect();
    tests.push(true);
  } catch (error) {
    console.log(`   ❌ Redis connection failed: ${error.message}`);
    console.log('   💡 Make sure Redis is running: docker-compose up redis -d');
    tests.push(false);
  }
  
  // Test 3: Database Configuration
  try {
    console.log('\n3. Testing Database Configuration...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found in environment variables');
    }
    
    console.log('   ✅ Database URL configured');
    console.log('   💡 Make sure PostgreSQL is running: docker-compose up postgres -d');
    tests.push(true);
  } catch (error) {
    console.log(`   ❌ Database configuration error: ${error.message}`);
    tests.push(false);
  }
  
  // Test 4: File System Setup
  try {
    console.log('\n4. Testing File System Setup...');
    
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const audioDir = path.join(uploadDir, 'audio');
    const thumbnailDir = path.join(uploadDir, 'thumbnails');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    console.log(`   ✅ Upload directory: ${uploadDir}`);
    console.log(`   ✅ Audio directory: ${audioDir}`);
    console.log(`   ✅ Thumbnail directory: ${thumbnailDir}`);
    tests.push(true);
  } catch (error) {
    console.log(`   ❌ File system setup error: ${error.message}`);
    tests.push(false);
  }
  
  // Test 5: Environment Variables
  try {
    console.log('\n5. Testing Environment Variables...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'UPLOAD_DIR',
      'MAX_FILE_SIZE'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log('   ✅ All required environment variables present');
    console.log(`   ✅ Upload dir: ${process.env.UPLOAD_DIR}`);
    console.log(`   ✅ Max file size: ${process.env.MAX_FILE_SIZE} bytes`);
    tests.push(true);
  } catch (error) {
    console.log(`   ❌ Environment variables error: ${error.message}`);
    tests.push(false);
  }
  
  // Test 6: Project Structure
  try {
    console.log('\n6. Testing Project Structure...');
    
    const requiredFiles = [
      'src/lib/openai.ts',
      'src/lib/queue.ts',
      'src/lib/workers.ts',
      'src/lib/video-processing.ts',
      'src/lib/ai-services.ts',
      'src/app/api/videos/process/route.ts',
      'src/app/api/search/route.ts'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing files: ${missingFiles.join(', ')}`);
    }
    
    console.log('   ✅ All Phase 2 files present');
    tests.push(true);
  } catch (error) {
    console.log(`   ❌ Project structure error: ${error.message}`);
    tests.push(false);
  }
  
  // Summary
  const passedTests = tests.filter(Boolean).length;
  const totalTests = tests.length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Phase 2 setup is complete and ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure your OpenAI API key is in .env.local');
    console.log('   2. Start the services: docker-compose up postgres redis -d');
    console.log('   3. Run migrations: npm run db:migrate');
    console.log('   4. Start the worker: npm run worker:dev');
    console.log('   5. Start the main app: npm run dev');
    console.log('   6. Upload a video and start AI processing!');
    console.log('\n🔗 Useful URLs:');
    console.log('   - App: http://localhost:3000');
    console.log('   - Upload: http://localhost:3000/dashboard/upload');
    console.log('   - Database Studio: npm run db:studio');
  } else {
    console.log('❌ Some tests failed. Please fix the issues above before proceeding.');
    console.log('\n🔧 Common fixes:');
    console.log('   - Add OpenAI API key to .env.local');
    console.log('   - Start Redis: docker-compose up redis -d');
    console.log('   - Start PostgreSQL: docker-compose up postgres -d');
    console.log('   - Run: npm install (if dependencies are missing)');
    process.exit(1);
  }
}

// Run the test
testPhase2Setup().catch(console.error);
