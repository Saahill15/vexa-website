import { randomUUID } from "crypto";
import { mkdir, readFile, rename, stat, writeFile } from "fs/promises";
import path from "path";

/*
 * A small file-based store: one JSON file per collection in the data folder.
 * Writes go through `update`, which runs one at a time per collection and replaces the file atomically,
 * so a crash mid-write never leaves a half-written file. Fine for a site of this size; swap this module for a
 * database when traffic needs it, the rest of the code only uses readAll, update and newId.
 */

export function dataDir(): string {
  return process.env.VEXA_DATA_DIR ?? path.join(process.cwd(), "data");
}

const file = (name: string) => path.join(dataDir(), `${name}.json`);
const queues = new Map<string, Promise<unknown>>();

export const newId = () => randomUUID();

export async function exists(name: string): Promise<boolean> {
  try {
    await stat(file(name));
    return true;
  } catch {
    return false;
  }
}

export async function readAll<T>(name: string): Promise<T[]> {
  try {
    return JSON.parse(await readFile(file(name), "utf8")) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error; // a damaged file is never overwritten
  }
}

/** Change a collection. `fn` edits `rows` in place and may return a value. Nothing is written if it throws. */
export function update<T, R = void>(name: string, fn: (rows: T[]) => R | Promise<R>): Promise<R> {
  const previous = queues.get(name) ?? Promise.resolve();
  const run = previous.catch(() => undefined).then(async () => {
    const rows = await readAll<T>(name);
    const result = await fn(rows);
    await mkdir(dataDir(), { recursive: true, mode: 0o700 });
    const tmp = `${file(name)}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(rows, null, 2), { mode: 0o600 });
    await rename(tmp, file(name));
    return result;
  });
  queues.set(name, run);
  return run;
}
