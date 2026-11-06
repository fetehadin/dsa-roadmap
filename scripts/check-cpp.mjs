// Compiles every code/**/*.cpp with g++ -std=c++17, runs it (stdin from .in if present)
// and diffs stdout against the .out file. Use --update to (re)write .out files.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('code');
const build = path.resolve('.cpp-build');
const update = process.argv.includes('--update');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
fs.mkdirSync(build, { recursive: true });

const files = [];
const walk = (d) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.cpp')) files.push(p);
  }
};
walk(root);

let fail = 0;
for (const file of files.sort()) {
  const rel = path.relative(root, file);
  if (only.length && !only.some((o) => rel.includes(o))) continue;
  const base = file.slice(0, -4);
  const exe = path.join(build, rel.replace(/[\\/]/g, '_').replace(/\.cpp$/, ''));
  try {
    execFileSync('g++', ['-std=c++17', '-Wall', '-Wextra', '-O1', '-o', exe, file], {
      stdio: 'pipe',
    });
  } catch (e) {
    console.log(`✗ ${rel}: compile error\n${e.stderr}`);
    fail++;
    continue;
  }
  if (rel.includes('starter')) {
    console.log(`✓ ${rel} (starter: compiles)`);
    continue;
  }
  const input = fs.existsSync(`${base}.in`) ? fs.readFileSync(`${base}.in`) : '';
  const run = spawnSync(exe, { input, timeout: 5000 });
  const out = run.stdout.toString();
  if (run.status !== 0) {
    console.log(`✗ ${rel}: exit code ${run.status}`);
    fail++;
    continue;
  }
  const expectedFile = `${base}.out`;
  if (update || !fs.existsSync(expectedFile)) {
    fs.writeFileSync(expectedFile, out);
    console.log(`✎ ${rel}: wrote ${path.basename(expectedFile)}`);
    continue;
  }
  const expected = fs.readFileSync(expectedFile, 'utf8');
  if (expected !== out) {
    console.log(`✗ ${rel}: output differs\n--- expected\n${expected}\n--- got\n${out}`);
    fail++;
  } else console.log(`✓ ${rel}`);
}
console.log(
  fail ? `\n${fail} file(s) failed.` : `\nAll C++ files compile and match their expected output.`,
);
process.exit(fail ? 1 : 0);
