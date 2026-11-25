import { spawn } from 'node:child_process';

/**
 * Creates a model caller that runs a shell command for every prompt. The prompt is
 * written to the command's standard input and the reply is read from its standard
 * output, so any model or script can be benchmarked: `--cmd "ollama run llama3"`,
 * `--cmd "claude -p"`, `--cmd "./my-model.sh"`.
 *
 * @param command - The shell command line.
 * @param timeoutMs - Kill the command after this long (default 180000).
 * @returns An async function from prompt to reply text.
 */
export const createCommandProvider = (command, timeoutMs = 180000) => (prompt) =>
  new Promise((resolve, reject) => {
    const child = spawn('sh', ['-c', command], { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`command timed out after ${timeoutMs} ms`));
    }, timeoutMs);
    child.stdout.on('data', (chunk) => (out += chunk));
    child.stderr.on('data', (chunk) => (err += chunk));
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(out);
      else reject(new Error(`command exited with ${code}: ${err.slice(0, 200)}`));
    });
    child.stdin.on('error', () => undefined);
    child.stdin.end(prompt);
  });
