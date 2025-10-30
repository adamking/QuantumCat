const { ethers, network, run } = require("hardhat");

async function main() {
  console.log("🐱⚛️ Deploying QuantumCat - FINAL RENOUNCED VERSION\n");
  console.log("⚠️  CRITICAL: This deployment is PERMANENT and IMMUTABLE!");
  console.log("    🔒 NO admin functions");
  console.log("    🔒 NO future upgrades");
  console.log("    🔒 NO parameter changes");
  console.log("    🔒 NO additional features");
  console.log("    ✅ 100% trustless and decentralized\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", network.name, `(Chain ID: ${chainId})\n`);

  // FINAL IMMUTABLE PARAMETERS
  const initialHolder = deployer.address; // Will distribute after deployment
  const initialSupply = ethers.parseEther("66260701"); // Planck's constant
  const reboxFeeBps = 400; // 4% - balanced for eternal operation

  console.log("📊 FINAL IMMUTABLE Parameters:");
  console.log("- Initial Supply: 66,260,701 QCAT (Planck's constant)");
  console.log("- Rebox Fee: 4% (400 basis points)");
  console.log("- Monthly Deflation: ~0.84% at 30% volume");
  console.log("- Sustainability: 7-10 year runway");
  console.log("- Initial Holder:", initialHolder);
  console.log("\n⚠️  THESE VALUES CANNOT BE CHANGED AFTER DEPLOYMENT!\n");

  // Triple confirmation for mainnet
  if (network.name === "mainnet" || chainId === 8453n) {
    console.log("\n🚨 MAINNET DEPLOYMENT - THIS IS PERMANENT! 🚨");
    console.log("🔒 Once deployed, these contracts will run FOREVER");
    console.log("🔒 No admin functions exist to change ANYTHING");
    console.log("🔒 Make sure you understand the implications\n");
    
    console.log("Waiting 15 seconds... Press Ctrl+C to cancel");
    for (let i = 15; i > 0; i--) {
      process.stdout.write(`\r${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("\n\nProceeding with deployment...\n");
  }

  // Compute controller address
  const controllerAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: await ethers.provider.getTransactionCount(deployer.address)
  });

  // Deploy QCAT Token
  console.log("🚀 Step 1/4: Deploying QCAT Token...");
  const QCATToken = await ethers.getContractFactory("QCATToken");
  const qcat = await QCATToken.deploy(
    controllerAddress,
    initialHolder,
    initialSupply
  );
  await qcat.waitForDeployment();
  const qcatAddress = await qcat.getAddress();
  console.log("   ✅ QCAT deployed at:", qcatAddress);

  // Deploy ALIVECAT Token
  console.log("\n🚀 Step 2/4: Deploying ALIVECAT Token...");
  const ALIVECATToken = await ethers.getContractFactory("ALIVECATToken");
  const alivecat = await ALIVECATToken.deploy(controllerAddress);
  await alivecat.waitForDeployment();
  const alivecatAddress = await alivecat.getAddress();
  console.log("   ✅ ALIVECAT deployed at:", alivecatAddress);

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
    qcatAddress,
    alivecatAddress,
    deadcatAddress,
    reboxFeeBps
  );
  await controller.waitForDeployment();
  const actualControllerAddress = await controller.getAddress();
  
  if (actualControllerAddress.toLowerCase() !== controllerAddress.toLowerCase()) {
    console.error("❌ ERROR: Controller address mismatch!");
    process.exit(1);
  }
  
  console.log("   ✅ Controller deployed at:", actualControllerAddress);

  console.log("\n✅ Deployment Complete!");
  console.log("==========================================");
  console.log("QCAT Token:        ", qcatAddress);
  console.log("ALIVECAT Token:    ", alivecatAddress);
  console.log("DEADCAT Token:     ", deadcatAddress);
  console.log("Controller:        ", actualControllerAddress);
  console.log("==========================================");
  console.log("\n🔒 IMMUTABLE CONTRACTS DEPLOYED!");
  console.log("🔒 NO admin control - fully autonomous");
  console.log("🔒 Will run forever on the blockchain\n");

  // Verify contracts
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await controller.deploymentTransaction().wait(6);

    const explorerName = chainId === 8453n || chainId === 84532n ? 'Basescan' : 'Etherscan';
    console.log(`\nVerifying contracts on ${explorerName}...`);
    
    try {
      await run("verify:verify", {
        address: qcatAddress,
        constructorArguments: [controllerAddress, initialHolder, initialSupply.toString()],
      });
      
      await run("verify:verify", {
        address: alivecatAddress,
        constructorArguments: [controllerAddress],
      });
      
      await run("verify:verify", {
        address: deadcatAddress,
        constructorArguments: [controllerAddress],
      });
      
      await run("verify:verify", {
        address: actualControllerAddress,
        constructorArguments: [qcatAddress, alivecatAddress, deadcatAddress, reboxFeeBps],
      });
      
      console.log("✅ All contracts verified!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    chainId: chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      qcat: qcatAddress,
      alivecat: alivecatAddress,
      deadcat: deadcatAddress,
      controller: actualControllerAddress,
    },
    parameters: {
      initialSupply: "66,260,701 QCAT",
      reboxFee: "4%",
      revealDelay: "5 blocks",
      gracePeriod: "64 blocks",
      immutable: true,
      renounced: true,
      noAdminControl: true,
    },
    distribution: {
      liquidity: "60% (39,756,420 QCAT)",
      community: "20% (13,252,140 QCAT)",
      team: "10% (6,626,070 QCAT)",
      reserve: "10% (6,626,070 QCAT)"
    },
    projections: {
      monthlyDeflation: "0.84% at 30% volume",
      yearlySupplyRemaining: {
        year1: "90.2%",
        year3: "73.5%",
        year5: "59.8%",
        year10: "35.7%"
      }
    }
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${deploymentsDir}/${network.name}-final-renounced-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${filename}\n`);

  console.log("🚨 CRITICAL NEXT STEPS (FIRST 24 HOURS):");
  console.log("1. Add 60% to liquidity pools:");
  console.log("   - 75% to QCAT/ETH on Uniswap V3");
  console.log("   - 25% to QCAT/USDC on Aerodrome");
  console.log("2. BURN or send LP tokens to 0x000...dead");
  console.log("3. Distribute community allocation");
  console.log("4. Set up team vesting contract");
  console.log("5. Announce full renouncement\n");
  
  console.log("⚠️  FINAL WARNING:");
  console.log("Once you distribute tokens and add liquidity,");
  console.log("this project will run AUTONOMOUSLY FOREVER.");
  console.log("There is NO way to change ANYTHING.\n");

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
