const { ethers, network, run } = require("hardhat");

/**
 * QuantumCat Unified Deployment Script
 * 
 * Supports both testing and production deployments with configurable parameters.
 * 
 * Environment Variables:
 * - DEPLOYMENT_MODE: "production" or "testing" (default: testing)
 * - INITIAL_HOLDER_ADDRESS: Address to receive initial CATBOX supply
 * - INITIAL_CATBOX_SUPPLY: Initial supply in wei (default: 662607015 * 10^18)
 * - REBOX_FEE_BPS: Rebox fee in basis points (default: 400 = 4%)
 * - SKIP_CONFIRMATION: Set to "true" to skip manual confirmations
 * 
 * Production Mode:
 * - Uses hardcoded optimal values (662.6M supply, 4% fee)
 * - Requires explicit confirmation
 * - Saves detailed deployment info
 * - Marks as "renounced" in deployment record
 * 
 * Testing Mode:
 * - Uses environment variables or defaults
 * - Shorter confirmation delays
 * - Suitable for testnets
 */

async function main() {
  console.log("🐱⚛️ QuantumCat Unified Deployment\n");
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", network.name, `(Chain ID: ${chainId})\n`);

  // Determine deployment mode
  const isProduction = process.env.DEPLOYMENT_MODE === "production";
  const isBaseMainnet = chainId === 8453n;
  const isBaseSepolia = chainId === 84532n;
  
  if (isBaseMainnet) {
    console.log("🔵 BASE MAINNET DEPLOYMENT");
    console.log("✅ Optimized for low-cost transactions");
    console.log("✅ Perfect for memecoin gameplay\n");
  } else if (isBaseSepolia) {
    console.log("🔵 BASE SEPOLIA TESTNET");
    console.log("✅ Test environment - safe to experiment\n");
  }

  // Configure deployment parameters
  let initialHolder, initialSupply, reboxFeeBps;
  
  if (isProduction) {
    // Production: Hardcoded optimal values for renounced deployment
    console.log("⚡ PRODUCTION MODE - FINAL RENOUNCED DEPLOYMENT");
    console.log("⚠️  CRITICAL: This deployment is PERMANENT and IMMUTABLE!");
    console.log("    🔒 NO admin functions");
    console.log("    🔒 NO future upgrades");
    console.log("    🔒 NO parameter changes");
    console.log("    ✅ 100% trustless and decentralized\n");
    
    initialHolder = process.env.INITIAL_HOLDER_ADDRESS || deployer.address;
    initialSupply = ethers.parseEther("662607015"); // Planck's constant (6.62607015 × 10⁻³⁴)
    reboxFeeBps = 400; // 4% - optimal for eternal operation
    
    console.log("📊 FINAL IMMUTABLE Parameters:");
    console.log("- Initial Supply: 662,607,015 CATBOX (Planck's constant)");
    console.log("- Rebox Fee: 4% (400 basis points)");
    console.log("- Monthly Deflation: ~0.84% at 30% volume");
    console.log("- Sustainability: 7-10 year runway");
    console.log("- Initial Holder:", initialHolder);
    console.log("\n⚠️  THESE VALUES CANNOT BE CHANGED AFTER DEPLOYMENT!\n");
  } else {
    // Testing: Use environment variables or defaults
    console.log("🧪 TESTING MODE - Configurable Deployment");
    console.log("✅ Parameters can be adjusted via environment variables\n");
    
    initialHolder = process.env.INITIAL_HOLDER_ADDRESS || deployer.address;
    initialSupply = process.env.INITIAL_CATBOX_SUPPLY 
      ? ethers.parseEther(process.env.INITIAL_CATBOX_SUPPLY)
      : ethers.parseEther("662607015");
    reboxFeeBps = process.env.REBOX_FEE_BPS ? parseInt(process.env.REBOX_FEE_BPS) : 400;
    
    console.log("Deployment parameters:");
    console.log("- Initial Holder:", initialHolder);
    console.log("- Initial CATBOX Supply:", ethers.formatEther(initialSupply));
    console.log("- Rebox Fee:", reboxFeeBps, "bps =", (reboxFeeBps / 100).toFixed(2) + "%");
    console.log("\n💡 Tip: Set DEPLOYMENT_MODE=production for final deployment\n");
  }

  // Validate parameters
  if (reboxFeeBps > 10000) {
    console.error("❌ ERROR: Rebox fee cannot exceed 10000 bps (100%)");
    process.exit(1);
  }
  
  if (initialHolder === ethers.ZeroAddress) {
    console.error("❌ ERROR: Initial holder cannot be zero address");
    process.exit(1);
  }

  // Confirmation delays
  if (process.env.SKIP_CONFIRMATION !== "true") {
    if (isProduction || isBaseMainnet) {
      console.log("\n🚨 MAINNET/PRODUCTION DEPLOYMENT - THIS IS PERMANENT! 🚨");
      console.log("🔒 Once deployed, these contracts will run FOREVER");
      console.log("🔒 No admin functions exist to change ANYTHING");
      console.log("🔒 Make sure you understand the implications\n");
      console.log("Waiting 15 seconds... Press Ctrl+C to cancel");
      
      for (let i = 15; i > 0; i--) {
        process.stdout.write(`\r${i} seconds remaining...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log("\n\nProceeding with deployment...\n");
    } else {
      console.log("\n⏸️  Pausing 5 seconds for review...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Compute controller address (CREATE deterministic address)
  const controllerNonce = await ethers.provider.getTransactionCount(deployer.address);
  const controllerAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: controllerNonce
  });
  console.log("📍 Computed controller address:", controllerAddress);

  // Deploy CATBOX Token
  console.log("\n🚀 Step 1/4: Deploying CATBOX Token...");
  const CATBOXToken = await ethers.getContractFactory("CATBOXToken");
  const catbox = await CATBOXToken.deploy(
    controllerAddress,
    initialHolder,
    initialSupply
  );
  await catbox.waitForDeployment();
  const catboxAddress = await catbox.getAddress();
  console.log("   ✅ CATBOX deployed at:", catboxAddress);

  // Deploy LIVECAT Token
  console.log("\n🚀 Step 2/4: Deploying LIVECAT Token...");
  const LIVECATToken = await ethers.getContractFactory("LIVECATToken");
  const livecat = await LIVECATToken.deploy(controllerAddress);
  await livecat.waitForDeployment();
  const livecatAddress = await livecat.getAddress();
  console.log("   ✅ LIVECAT deployed at:", livecatAddress);

  // Deploy DEADCAT Token
  console.log("\n🚀 Step 3/4: Deploying DEADCAT Token...");
  const DEADCATToken = await ethers.getContractFactory("DEADCATToken");
  const deadcat = await DEADCATToken.deploy(controllerAddress);
  await deadcat.waitForDeployment();
  const deadcatAddress = await deadcat.getAddress();
  console.log("   ✅ DEADCAT deployed at:", deadcatAddress);

  // Deploy Controller
  console.log("\n🚀 Step 4/4: Deploying Controller...");
  const QuantumCatController = await ethers.getContractFactory("QuantumCatController");
  const controller = await QuantumCatController.deploy(
    catboxAddress,
    livecatAddress,
    deadcatAddress,
    reboxFeeBps
  );
  await controller.waitForDeployment();
  const actualControllerAddress = await controller.getAddress();
  
  // Verify address matches prediction
  if (actualControllerAddress.toLowerCase() !== controllerAddress.toLowerCase()) {
    console.error("❌ ERROR: Controller address mismatch!");
    console.error("   Expected:", controllerAddress);
    console.error("   Got:", actualControllerAddress);
    process.exit(1);
  }
  
  console.log("   ✅ Controller deployed at:", actualControllerAddress);

  console.log("\n✅ Deployment Complete!");
  console.log("==========================================");
  console.log("CATBOX Token:      ", catboxAddress);
  console.log("LIVECAT Token:     ", livecatAddress);
  console.log("DEADCAT Token:     ", deadcatAddress);
  console.log("Controller:        ", actualControllerAddress);
  console.log("==========================================");
  
  if (isProduction) {
    console.log("\n🎉 IMMUTABLE MEMECOIN DEPLOYED!");
    console.log("🔒 ZERO admin control on all contracts");
    console.log("✅ Fully renounced and autonomous");
  } else {
    console.log("\n✅ Test deployment successful!");
  }
  
  console.log("✅ All tokens are standard ERC-20");
  console.log("✅ Ready for exchange listings!");
  console.log("✅ Ready for DEX liquidity pools!\n");

  // Verify contracts on explorer
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await controller.deploymentTransaction().wait(6);

    const explorerName = (chainId === 8453n || chainId === 84532n) ? 'Basescan' : 'Etherscan';
    console.log(`\nVerifying contracts on ${explorerName}...`);
    
    try {
      // Verify CATBOX
      console.log("Verifying CATBOX Token...");
      await run("verify:verify", {
        address: catboxAddress,
        constructorArguments: [controllerAddress, initialHolder, initialSupply.toString()],
      });
      console.log("✅ CATBOX verified!");

      // Verify LIVECAT
      console.log("Verifying LIVECAT Token...");
      await run("verify:verify", {
        address: livecatAddress,
        constructorArguments: [controllerAddress],
      });
      console.log("✅ LIVECAT verified!");

      // Verify DEADCAT
      console.log("Verifying DEADCAT Token...");
      await run("verify:verify", {
        address: deadcatAddress,
        constructorArguments: [controllerAddress],
      });
      console.log("✅ DEADCAT verified!");

      // Verify Controller
      console.log("Verifying Controller...");
      await run("verify:verify", {
        address: actualControllerAddress,
        constructorArguments: [catboxAddress, livecatAddress, deadcatAddress, reboxFeeBps],
      });
      console.log("✅ Controller verified!");

      console.log("\n✅ All contracts verified!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
      if (chainId === 8453n || chainId === 84532n) {
        console.log("\n💡 For Base, ensure BASESCAN_API_KEY is set in .env");
        console.log("   Get one at: https://basescan.org/myapikey");
      }
    }
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    mode: isProduction ? "production" : "testing",
    network: network.name,
    chainId: chainId.toString(),
    architecture: "ERC-20 (Exchange-Compatible)",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      catbox: catboxAddress,
      livecat: livecatAddress,
      deadcat: deadcatAddress,
      controller: actualControllerAddress,
    },
    parameters: {
      initialHolder,
      initialSupply: ethers.formatEther(initialSupply),
      reboxFeeBps,
      reboxFeePercent: (reboxFeeBps / 100).toFixed(2) + "%",
      immutable: true,
      noAdminControl: true,
      renounced: isProduction,
    },
    links: {
      catbox: chainId === 8453n ? `https://basescan.org/token/${catboxAddress}` :
             chainId === 84532n ? `https://sepolia.basescan.org/token/${catboxAddress}` :
             `https://etherscan.io/token/${catboxAddress}`,
      livecat: chainId === 8453n ? `https://basescan.org/token/${livecatAddress}` :
                chainId === 84532n ? `https://sepolia.basescan.org/token/${livecatAddress}` :
                `https://etherscan.io/token/${livecatAddress}`,
      deadcat: chainId === 8453n ? `https://basescan.org/token/${deadcatAddress}` :
               chainId === 84532n ? `https://sepolia.basescan.org/token/${deadcatAddress}` :
               `https://etherscan.io/token/${deadcatAddress}`,
      controller: chainId === 8453n ? `https://basescan.org/address/${actualControllerAddress}` :
                  chainId === 84532n ? `https://sepolia.basescan.org/address/${actualControllerAddress}` :
                  `https://etherscan.io/address/${actualControllerAddress}`,
    }
  };

  // Add production-specific info
  if (isProduction) {
    deploymentInfo.distribution = {
      liquidity: "60% (397,564,209 CATBOX)",
      community: "20% (132,521,403 CATBOX)",
      team: "10% (66,260,701 CATBOX)",
      reserve: "10% (66,260,702 CATBOX)"
    };
    deploymentInfo.projections = {
      monthlyDeflation: "0.84% at 30% volume",
      yearlySupplyRemaining: {
        year1: "90.2%",
        year3: "73.5%",
        year5: "59.8%",
        year10: "35.7%"
      }
    };
  }

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const modeTag = isProduction ? "production" : "test";
  const filename = `${deploymentsDir}/${network.name}-${modeTag}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${filename}\n`);

  // Next steps
  if (isProduction) {
    console.log("🚨 CRITICAL NEXT STEPS (FIRST 24 HOURS):");
    console.log("1. Add liquidity to Base DEXs:");
    console.log("   - 75% to CATBOX/ETH on Uniswap V3");
    console.log("   - 25% to CATBOX/USDC on Aerodrome");
    console.log("2. BURN or send LP tokens to 0x000...dead");
    console.log("3. Distribute community allocation");
    console.log("4. Set up team vesting contract");
    console.log("5. Announce full renouncement\n");
    
    console.log("⚠️  FINAL WARNING:");
    console.log("Once you distribute tokens and add liquidity,");
    console.log("this project will run AUTONOMOUSLY FOREVER.");
    console.log("There is NO way to change ANYTHING.\n");
  } else {
    console.log("📋 NEXT STEPS:");
    console.log("1. Test observe and rebox functions");
    console.log("2. Create liquidity pools on testnet DEXs");
    console.log("3. Verify all mechanics work as expected");
    console.log("4. When ready, deploy to mainnet with DEPLOYMENT_MODE=production\n");
  }

  return {
    catbox: catboxAddress,
    livecat: livecatAddress,
    deadcat: deadcatAddress,
    controller: actualControllerAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

