require('iterator-helpers-polyfill');

const REPEAT = 10;
const LENGTH = 10_000_000;
const TAKE = 5;

const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

// 강제 GC 실행 (Node 실행 시 --expose-gc 필요)
const runGC = () => {
  if (global.gc) global.gc();
};

// Generator: 1부터 LENGTH까지 순차적으로 생성
function* range(n) {
  for (let i = 1; i <= n; i++) {
    yield i;
  }
}

const arrayBenchmark = () => {
  runGC();
  const arr = Array.from({ length: LENGTH }, (_, i) => i + 1);
  const memStart = process.memoryUsage().heapUsed;
  const t0 = performance.now();
  const result = arr
    .filter(n => n % 2 === 0)
    .map(n => n * 2)
    .slice(0, TAKE);
  const t1 = performance.now();
  const memEnd = process.memoryUsage().heapUsed;
  return {
    time: t1 - t0,
    memory: memEnd - memStart,
    result,
  };
};

const iteratorBenchmark = () => {
  runGC();
  const memStart = process.memoryUsage().heapUsed;
  const t0 = performance.now();
  const iter = range(LENGTH)
    .filter(n => n % 2 === 0)
    .map(n => n * 2)
    .take(TAKE);
  const result = [...iter];
  const t1 = performance.now();
  const memEnd = process.memoryUsage().heapUsed;
  return {
    time: t1 - t0,
    memory: memEnd - memStart,
    result,
  };
};

const repeatBenchmark = (fn) => {
  let totalTime = 0;
  let totalMem = 0;
  let lastResult = null;
  for (let i = 0; i < REPEAT; i++) {
    const { time, memory, result } = fn();
    totalTime += time;
    totalMem += memory;
    lastResult = result;
  }
  return {
    avgTime: (totalTime / REPEAT).toFixed(2),
    avgMem: formatMB(totalMem / REPEAT),
    lastResult,
  };
};

console.log('Array 방식 벤치마크...');
const arrayStats = repeatBenchmark(arrayBenchmark);
console.log('Array result:', arrayStats.lastResult);
console.log(`Array 평균 시간: ${arrayStats.avgTime} ms, 평균 메모리: ${arrayStats.avgMem} MB`);

console.log('\nIterator 방식 벤치마크...');
const iteratorStats = repeatBenchmark(iteratorBenchmark);
console.log('Iterator result:', iteratorStats.lastResult);
console.log(`Iterator 평균 시간: ${iteratorStats.avgTime} ms, 평균 메모리: ${iteratorStats.avgMem} MB`);
