const dryRun = process.env.DRY_RUN !== "false";
if (!process.env.LURYN_CONTRACT_ADDRESS) throw new Error("LURYN_CONTRACT_ADDRESS is required");
console.log(dryRun ? "Dry run: no classification transaction submitted." : "Configure a wallet client before enabling keeper writes.");
