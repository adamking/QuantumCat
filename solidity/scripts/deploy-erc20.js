const { ethers, network, run } = require("hardhat");

async function main() {
  console.log("🐱⚛️ Deploying QuantumCat (ERC-20 Architecture)...\n");
  console.log("⚠️  NEW ARCHITECTURE: Three separate ERC-20 tokens!");
  console.log("    ✅ QCAT, ALIVECAT, DEADCAT - all ERC-20 standard");
  console.log("    ✅ Compatible with ALL exchanges and DEXs");
  console.log("    ✅ Can create Uniswap/Aerodrome pairs");
  console.log("    ✅ ZERO admin control - fully immutable\n");

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

  // Get deployment parameters
  const initialHolder = process.env.INITIAL_HOLDER_ADDRESS || deployer.address;
  const initialSupply = process.env.INITIAL_QCAT_SUPPLY || ethers.parseEther("1000000");
  const reboxFeeBps = process.env.REBOX_FEE_BPS || 500;

  console.log("Deployment parameters (IMMUTABLE):");
  console.log("- QCAT Token: QuantumCat (ERC-20)");
  console.log("- ALIVECAT Token: AliveCat (ERC-20)");
  console.log("- DEADCAT Token: DeadCat (ERC-20)");
  console.log("- Controller: QuantumCatController (manages all mechanics)");
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
    console.log("Press Ctrl+C to cancel, or wait 10 seconds to continue...\n");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // Step 1: Deploy Controller first (so we can pass its address to tokens)
  console.log("\n🚀 Step 1/4: Deploying QuantumCatController...");
  const QuantumCatController = await ethers.getContractFactory("QuantumCatController");
  
  // We need to deploy with placeholder addresses first, then set tokens
  // Actually, let's use CREATE2 or deploy tokens first with controller=address(1), then set
  // Better: Deploy controller with zero addresses, then tokens, then initialize
  // Actually the contracts expect controller in constructor... let's compute the address
  
  // Alternative: Deploy tokens first with a temporary address, or use a factory pattern
  // Simplest: Deploy controller as a placeholder, deploy tokens with controller address, done
  
  console.log("   Computing controller address...");
  const controllerAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: await ethers.provider.getTransactionCount(deployer.address)
  });
  console.log("   Future controller address:", controllerAddress);

  // Step 2: Deploy QCAT Token
  console.log("\n🚀 Step 2/4: Deploying QCAT Token (ERC-20)...");
  const QCATToken = await ethers.getContractFactory("QCATToken");
  const qcat = await QCATToken.deploy(
    controllerAddress,  // controller address
    initialHolder,      // initial holder
    initialSupply       // initial supply
  );
  await qcat.waitForDeployment();
  const qcatAddress = await qcat.getAddress();
  console.log("   ✅ QCAT deployed at:", qcatAddress);

  // Step 3: Deploy ALIVECAT Token
  console.log("\n🚀 Step 3/4: Deploying ALIVECAT Token (ERC-20)...");
  const ALIVECATToken = await ethers.getContractFactory("ALIVECATToken");
  const alivecat = await ALIVECATToken.deploy(controllerAddress);
  await alivecat.waitForDeployment();
  const alivecatAddress = await alivecat.getAddress();
  console.log("   ✅ ALIVECAT deployed at:", alivecatAddress);

  // Step 4: Deploy DEADCAT Token
  console.log("\n🚀 Step 4/4: Deploying DEADCAT Token (ERC-20)...");
  const DEADCATToken = await ethers.getContractFactory("DEADCATToken");
  const deadcat = await DEADCATToken.deploy(controllerAddress);
  await deadcat.waitForDeployment();
  const deadcatAddress = await deadcat.getAddress();
  console.log("   ✅ DEADCAT deployed at:", deadcatAddress);

  // Step 5: Deploy Controller
  console.log("\n🚀 Step 5/5: Deploying QuantumCatController...");
  const controller = await QuantumCatController.deploy(
    qcatAddress,
    alivecatAddress,
    deadcatAddress,
    reboxFeeBps
  );
  await controller.waitForDeployment();
  const actualControllerAddress = await controller.getAddress();
  
  // Verify the address matches
  if (actualControllerAddress.toLowerCase() !== controllerAddress.toLowerCase()) {
    console.error("❌ ERROR: Controller address mismatch!");
    console.error("   Expected:", controllerAddress);
    console.error("   Got:", actualControllerAddress);
    process.exit(1);
  }
  
  console.log("   ✅ Controller deployed at:", actualControllerAddress);

  console.log("\n✅ Deployment successful!");
  console.log("==========================================");
  console.log("QCAT Token:        ", qcatAddress);
  console.log("ALIVECAT Token:    ", alivecatAddress);
  console.log("DEADCAT Token:     ", deadcatAddress);
  console.log("Controller:        ", actualControllerAddress);
  console.log("==========================================");
  console.log("\n🎉 IMMUTABLE MEMECOIN DEPLOYED!");
  console.log("🔒 ZERO admin control on all contracts");
  console.log("✅ All tokens are standard ERC-20");
  console.log("✅ Ready for exchange listings!");
  console.log("✅ Ready for DEX liquidity pools!\n");

  // Verify contracts on Basescan/Etherscan
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await controller.deploymentTransaction().wait(6);

    const explorerName = chainId === 8453n || chainId === 84532n ? 'Basescan' : 'Etherscan';
    console.log(`\nVerifying contracts on ${explorerName}...`);
    
    try {
      // Verify QCAT
      console.log("Verifying QCAT Token...");
      await run("verify:verify", {
        address: qcatAddress,
        constructorArguments: [controllerAddress, initialHolder, initialSupply.toString()],
      });
      console.log("✅ QCAT verified!");

      // Verify ALIVECAT
      console.log("Verifying ALIVECAT Token...");
      await run("verify:verify", {
        address: alivecatAddress,
        constructorArguments: [controllerAddress],
      });
      console.log("✅ ALIVECAT verified!");

      // Verify DEADCAT
      console.log("Verifying DEADCAT Token...");
      await run("verify:verify", {
        address: deadcatAddress,
        constructorArguments: [controllerAddress],
      });
      console.log("✅ DEADCAT verified!");

      // Verify Controller
      console.log("Verifying QuantumCatController...");
      await run("verify:verify", {
        address: actualControllerAddress,
        constructorArguments: [qcatAddress, alivecatAddress, deadcatAddress, reboxFeeBps],
      });
      console.log("✅ Controller verified!");

      console.log("\n✅ All contracts verified!");
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
    architecture: "ERC-20 (Exchange-Compatible)",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      qcat: qcatAddress,
      alivecat: alivecatAddress,
      deadcat: deadcatAddress,
      controller: actualControllerAddress,
    },
    parameters: {
      initialHolder,
      initialSupply: initialSupply.toString(),
      reboxFeeBps,
      immutable: true,
      noAdminControl: true,
    },
    links: {
      qcat: chainId === 8453n ? `https://basescan.org/token/${qcatAddress}` :
             chainId === 84532n ? `https://sepolia.basescan.org/token/${qcatAddress}` :
             `https://etherscan.io/token/${qcatAddress}`,
      alivecat: chainId === 8453n ? `https://basescan.org/token/${alivecatAddress}` :
                chainId === 84532n ? `https://sepolia.basescan.org/token/${alivecatAddress}` :
                `https://etherscan.io/token/${alivecatAddress}`,
      deadcat: chainId === 8453n ? `https://basescan.org/token/${deadcatAddress}` :
               chainId === 84532n ? `https://sepolia.basescan.org/token/${deadcatAddress}` :
               `https://etherscan.io/token/${deadcatAddress}`,
      controller: chainId === 8453n ? `https://basescan.org/address/${actualControllerAddress}` :
                  chainId === 84532n ? `https://sepolia.basescan.org/address/${actualControllerAddress}` :
                  `https://etherscan.io/address/${actualControllerAddress}`,
    }
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${deploymentsDir}/${network.name}-erc20-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${filename}\n`);

  console.log("📋 NEXT STEPS:");
  console.log("1. Create liquidity pools on Uniswap/Aerodrome:");
  console.log("   - QCAT/ETH or QCAT/USDC");
  console.log("   - ALIVECAT/ETH (optional)");
  console.log("   - DEADCAT/ETH (optional)");
  console.log("2. Apply for exchange listings (now ERC-20 compatible!)");
  console.log("3. Add tokens to CoinGecko/CoinMarketCap");
  console.log("4. Update website with contract addresses");
  console.log("5. Launch marketing campaign\n");

  return {
    qcat: qcatAddress,
    alivecat: alivecatAddress,
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

