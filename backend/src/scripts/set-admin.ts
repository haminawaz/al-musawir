import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { z } from "zod";
import { disconnectDatabases } from "../db/client.js";
import { setAdmin } from "../modules/auth/auth.service.js";
import { newPasswordSchema } from "../modules/auth/auth.schema.js";

// Sets the one admin account: creates it, or replaces its email, name and password.
// A new password signs out every open dashboard session.
//
//   npm run admin:set -- --email admin@example.com --name "Admin"
//
// The password is asked for (hidden), or read from ADMIN_PASSWORD when there is no terminal.
// It is never taken as a command-line flag, so it does not end up in shell history.

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const output = rl as unknown as { _writeToOutput: (s: string) => void };
    let asked = false;
    output._writeToOutput = (s: string) => {
      if (!asked) process.stdout.write(s);
      asked = true;
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" } } });
  const email = (values.email ?? process.env.ADMIN_EMAIL ?? "").trim();
  const name = (values.name ?? process.env.ADMIN_NAME ?? "Admin").trim();
  if (!z.email().safeParse(email).success) throw new Error("Give a valid email: --email admin@example.com");
  if (!name) throw new Error("Give a name: --name \"Admin\"");

  let password = process.env.ADMIN_PASSWORD;
  if (process.stdin.isTTY) {
    password = await askHidden("New password: ");
    if ((await askHidden("Repeat it: ")) !== password) throw new Error("The passwords do not match.");
  }
  if (!password) throw new Error("No password: run this in a terminal, or set ADMIN_PASSWORD.");
  const check = newPasswordSchema.safeParse(password);
  if (!check.success) throw new Error(check.error.issues[0]?.message ?? "Password is not valid.");

  const result = await setAdmin({ email, name, password });
  console.log(result === "created" ? `Admin account created for ${email}.` : `Admin account updated: ${email}. Open sessions are signed out.`);
}

main()
  .catch((error: unknown) => {
    console.error((error as Error).message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabases);
