/**
 * Comprehensive Test Suite Runner
 */
async function runAll() {
  console.log('====================================================');
  console.log('STARTING DIGITAL HUMANITIES PORTFOLIO TEST SUITE');
  console.log('====================================================\n');

  const tests = [
    './normalization.test.js',
    './media-service.test.js',
    './repository-interface.test.js',
    './auth-interface.test.js',
    './portfolio-api.test.js',
    './migration.test.js'
  ];

  let passed = 0;
  let failed = 0;

  for (const testFile of tests) {
    try {
      await import(testFile);
      passed++;
    } catch (err) {
      console.error(`❌ FAILED: ${testFile}`);
      console.error(err);
      failed++;
    }
    console.log('');
  }

  console.log('====================================================');
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll();
