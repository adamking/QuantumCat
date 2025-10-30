const { ethers, network, run } = require("hardhat");

async function main() {
  console.log("🐱⚛️ Deploying QuantumCat (IMMUTABLE MEMECOIN)...\n");
  console.log("⚠️  WARNING: This contract has ZERO admin control!");
  console.log("    - No upgrades possible");
  console.log("    - No pause functionality");
  console.log("    - Fee is PERMANENT");
  console.log("    - URIs are hardcoded constants (IPFS)");
  console.log("    - True decentralized memecoin\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", network.name, `(Chain ID: ${chainId})\n`);

  // Base-specific warnings
  if (chainId === 8453n) {
    console.log("🔵 BASE MAINNET DEPLOYMENT DETECTED");
    console.log("✅ Optimized for low-cost transactions");
    console.log("✅ Perfect for memecoin gameplay\n");
  } else if (chainId === 84532n) {
    console.log("🔵 BASE SEPOLIA TESTNET DEPLOYMENT");
    console.log("✅ Test environment - safe to experiment\n");
  }

  // Get deployment parameters from environment or use defaults
  const initialHolder = process.env.INITIAL_HOLDER_ADDRESS || deployer.address;
  const initialSupply = process.env.INITIAL_QCAT_SUPPLY || ethers.parseEther("1000000");
  const reboxFeeBps = process.env.REBOX_FEE_BPS || 500;

  console.log("Deployment parameters (IMMUTABLE):");
  console.log("- Name: QuantumCat (hardcoded constant)");
  console.log("- Symbol: QCAT (hardcoded constant)");
  console.log("- URIs: IPFS (hardcoded in contract)");
  console.log("  ⚠️  VERIFY IPFS HASHES IN CONTRACT BEFORE MAINNET!");
  console.log("  - QCAT: Check contracts/QuantumCat.sol line ~141");
  console.log("  - ALIVECAT: Check contracts/QuantumCat.sol line ~145");
  console.log("  - DEADCAT: Check contracts/QuantumCat.sol line ~149");
  console.log("- Initial Holder:", initialHolder);
  console.log("- Initial QCAT Supply:", ethers.formatEther(initialSupply));
  console.log("- Rebox Fee:", reboxFeeBps, "bps (basis points) =", (reboxFeeBps / 100).toFixed(2) + "%");
  console.log("\n⚠️  These values are PERMANENT and cannot be changed!\n");

  // Validate parameters
  if (reboxFeeBps > 10000) {
    console.error("❌ ERROR: Rebox fee cannot exceed 10000 bps (100%)");
    process.exit(1);
  }

  // Confirm deployment
  if (process.env.SKIP_CONFIRMATION !== "true") {
    console.log("\n⏸️  Pausing 5 seconds for review...");
    console.log("   (Set SKIP_CONFIRMATION=true in .env to skip this pause)");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Confirm on mainnet or Base mainnet
  if (network.name === "mainnet" || chainId === 8453n) {
    console.log("\n⚠️  MAINNET DEPLOYMENT - PARAMETERS ARE PERMANENT!");
    console.log("⚠️  Ensure IPFS URIs are correct in the contract!");
    console.log("Press Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // Deploy QuantumCat contract
  console.log("\n🚀 Deploying QuantumCat contract...");
  const QuantumCat = await ethers.getContractFactory("QuantumCat");
  const quantumCat = await QuantumCat.deploy(
    initialHolder,
    initialSupply,
    reboxFeeBps
  );

  await quantumCat.waitForDeployment();
  const contractAddress = await quantumCat.getAddress();

  console.log("\n✅ Deployment successful!");
  console.log("-----------------------------------");
  console.log("Contract address:", contractAddress);
  console.log("-----------------------------------");
  console.log("\n🎉 IMMUTABLE MEMECOIN DEPLOYED!");
  console.log("🔒 Contract has ZERO admin control");
  console.log("🚀 Ready for community takeover\n");

  // Verify contract on Etherscan/Basescan if not on localhost
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await quantumCat.deploymentTransaction().wait(6);

    console.log(`\nVerifying contract on ${chainId === 8453n || chainId === 84532n ? 'Basescan' : 'Etherscan'}...`);
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          initialHolder,
          initialSupply.toString(),
          reboxFeeBps,
        ],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      if (chainId === 8453n || chainId === 84532n) {
        console.log("\n💡 For Base, ensure BASESCAN_API_KEY is set in .env");
        console.log("   Get one at: https://basescan.org/myapikey");
      }
    }
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    chainId: chainId.toString(),
    contract: contractAddress,
    contractType: "QuantumCat (Immutable Memecoin)",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    parameters: {
      name: "QuantumCat",
      symbol: "QCAT",
      uris: {
        qcat: "ipfs://QmTBD-REPLACE-BEFORE-MAINNET/0.json",
        alivecat: "ipfs://QmTBD-REPLACE-BEFORE-MAINNET/1.json",
        deadcat: "ipfs://QmTBD-REPLACE-BEFORE-MAINNET/2.json",
        note: "Verify actual URIs in deployed contract"
      },
      initialHolder,
      initialSupply: initialSupply.toString(),
      reboxFeeBps,
      immutable: true,
      noAdminControl: true,
    },
    links: {
      explorer: chainId === 8453n ? `https://basescan.org/address/${contractAddress}` :
                chainId === 84532n ? `https://sepolia.basescan.org/address/${contractAddress}` :
                chainId === 1n ? `https://etherscan.io/address/${contractAddress}` :
                `https://etherscan.io/address/${contractAddress}`,
    }
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${deploymentsDir}/${network.name}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${filename}\n`);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
