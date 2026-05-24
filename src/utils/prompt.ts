import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { appendFile } from "node:fs";

export async function confirm(
  question: string,
  defaultYes = false,
): Promise<boolean> {
  const rl = createInterface({ input, output });
  const hint = defaultYes ? "Y/n" : "y/N";
  const answer = await rl.question(`${question} [${hint}]: `);
  rl.close();
  const value = answer.trim().toLowerCase();
  if (!value) return defaultYes;
  return ["y", "yes"].includes(value);
}
