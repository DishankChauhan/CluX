#!/usr/bin/env node

// Worker startup script for AI processing
// This should be run as a separate process to handle background jobs

import './src/lib/workers.js';
import { videoProcessingQueue, transcriptionQueue, embeddingsQueue, highlightsQueue } from './src/lib/queue.js';
import { shutdownWorkers } from './src/lib/workers.js';

console.log('🚀 Starting AI processing workers...');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📢 Received SIGTERM, shutting down workers...');
  await shutdownWorkers();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📢 Received SIGINT, shutting down workers...');
  await shutdownWorkers();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('✅ AI processing workers are running...');
console.log('   - Video Processing Queue: Ready');
console.log('   - Transcription Queue: Ready');
console.log('   - Embeddings Queue: Ready');
console.log('   - Highlights Queue: Ready');
console.log('   Press Ctrl+C to stop');
