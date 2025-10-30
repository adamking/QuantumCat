const { run } = require("hardhat");

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  const implementationAddress = process.env.IMPLEMENTATION_ADDRESS;

  if (!proxyAddress && !implementationAddress) {
    throw new Error("Set PROXY_ADDRESS or IMPLEMENTATION_ADDRESS environment variable");
  }

  console.log("Verifying contract on Etherscan...\n");

  if (proxyAddress) {
    console.log("Proxy address:", proxyAddress);
    try {
      await run("verify:verify", {
        address: proxyAddress,
        constructorArguments: [],
      });
      console.log("✅ Proxy verified");
    } catch (error) {
      console.log("❌ Proxy verification failed:", error.message);
    }
  }

  if (implementationAddress) {
    console.log("\nImplementation address:", implementationAddress);
    try {
      await run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
      });
      console.log("✅ Implementation verified");
    } catch (error) {
      console.log("❌ Implementation verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
