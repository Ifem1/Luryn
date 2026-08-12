import { execFileSync } from "node:child_process";
const cli = process.platform === "win32" ? "genlayer.cmd" : "genlayer";
console.log(execFileSync(cli, ["deploy", "--contract", "contracts/luryn.py"], { encoding: "utf8" }));
