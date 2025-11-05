/**
 * Baseline performance benchmarks
 */

interface BenchmarkResult {
  name: string;
  duration: number;
  iterations: number;
  avgTime: number;
}

export function benchmark(name: string, fn: () => void, iterations = 1000): BenchmarkResult {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn();
  }

  const end = performance.now();
  const duration = end - start;

  return {
    name,
    duration,
    iterations,
    avgTime: duration / iterations,
  };
}

export async function asyncBenchmark(
  name: string,
  fn: () => Promise<void>,
  iterations = 100,
): Promise<BenchmarkResult> {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await fn();
  }

  const end = performance.now();
  const duration = end - start;

  return {
    name,
    duration,
    iterations,
    avgTime: duration / iterations,
  };
}

export function printResults(results: BenchmarkResult[]): void {
  console.log('\n=== Benchmark Results ===\n');

  for (const result of results) {
    console.log(`${result.name}:`);
    console.log(`  Total: ${result.duration.toFixed(2)}ms`);
    console.log(`  Iterations: ${result.iterations}`);
    console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
    console.log('');
  }
}
