const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("QuantumCat ERC-20 System", function () {
  // Helper for generating deterministic user entropy in tests
  const generateEntropy = (seed) => ethers.keccak256(ethers.toUtf8Bytes(`test_entropy_${seed}`));
  const DEFAULT_ENTROPY = generateEntropy("default");

  // Fixture to deploy the complete ERC-20 system
  async function deployQuantumCatERC20Fixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    // Pre-compute controller address using nonce
    const deployerNonce = await ethers.provider.getTransactionCount(owner.address);
    const controllerAddress = ethers.getCreateAddress({
      from: owner.address,
      nonce: deployerNonce + 3 // After deploying 3 tokens
    });

    // Deploy tokens
    const QCATToken = await ethers.getContractFactory("QCATToken");
    const ALIVECATToken = await ethers.getContractFactory("ALIVECATToken");
    const DEADCATToken = await ethers.getContractFactory("DEADCATToken");

    const qcat = await QCATToken.deploy(
      controllerAddress,
      owner.address,
      ethers.parseEther("1000000") // 1M QCAT initial supply
    );

    const alivecat = await ALIVECATToken.deploy(controllerAddress);
    const deadcat = await DEADCATToken.deploy(controllerAddress);

    // Deploy controller
    const QuantumCatController = await ethers.getContractFactory("QuantumCatController");
    const controller = await QuantumCatController.deploy(
      await qcat.getAddress(),
      await alivecat.getAddress(),
      await deadcat.getAddress(),
      500 // 5% fee (500 basis points)
    );

    // Verify controller address matches
    const actualControllerAddress = await controller.getAddress();
    if (actualControllerAddress !== controllerAddress) {
      throw new Error("Controller address mismatch!");
    }

    return { qcat, alivecat, deadcat, controller, owner, user1, user2, user3 };
  }

  describe("Deployment & Initialization", function () {
    it("Should deploy all contracts with correct addresses", async function () {
      const { qcat, alivecat, deadcat, controller } = await loadFixture(deployQuantumCatERC20Fixture);

      expect(await qcat.getAddress()).to.be.properAddress;
      expect(await alivecat.getAddress()).to.be.properAddress;
      expect(await deadcat.getAddress()).to.be.properAddress;
      expect(await controller.getAddress()).to.be.properAddress;
    });

    it("Should set correct token names and symbols", async function () {
      const { qcat, alivecat, deadcat } = await loadFixture(deployQuantumCatERC20Fixture);

      expect(await qcat.name()).to.equal("QuantumCat");
      expect(await qcat.symbol()).to.equal("QCAT");
      expect(await alivecat.name()).to.equal("AliveCat");
      expect(await alivecat.symbol()).to.equal("ALIVECAT");
      expect(await deadcat.name()).to.equal("DeadCat");
      expect(await deadcat.symbol()).to.equal("DEADCAT");
    });

    it("Should mint initial QCAT supply to owner", async function () {
      const { qcat, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      expect(await qcat.balanceOf(owner.address)).to.equal(
        ethers.parseEther("1000000")
      );
    });

    it("Should have zero initial supply for ALIVECAT and DEADCAT", async function () {
      const { alivecat, deadcat } = await loadFixture(deployQuantumCatERC20Fixture);

      expect(await alivecat.totalSupply()).to.equal(0);
      expect(await deadcat.totalSupply()).to.equal(0);
    });

    it("Should set controller as minter in tokens", async function () {
      const { qcat, alivecat, deadcat, controller } = await loadFixture(deployQuantumCatERC20Fixture);

      expect(await qcat.controller()).to.equal(await controller.getAddress());
      expect(await alivecat.controller()).to.equal(await controller.getAddress());
      expect(await deadcat.controller()).to.equal(await controller.getAddress());
    });

    it("Should set correct fee in controller", async function () {
      const { controller } = await loadFixture(deployQuantumCatERC20Fixture);

      expect(await controller.REBOX_FEE_BPS()).to.equal(500);
    });

    it("Should set correct constants", async function () {
      const { controller } = await loadFixture(deployQuantumCatERC20Fixture);

      expect(await controller.REVEAL_DELAY()).to.equal(5);
      expect(await controller.GRACE()).to.equal(64);
      expect(await controller.DATA_MAX()).to.equal(256);
      // MAX_BPS is private (_MAX_BPS), not exposed
    });
  });

  describe("Observe - Commit Phase", function () {
    it("Should commit observation and burn QCAT", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const data = ethers.toUtf8Bytes("test_data_t5");
      const dataHash = ethers.keccak256(data);

      const balanceBefore = await qcat.balanceOf(owner.address);

      // Approve controller to burn QCAT
      await qcat.approve(await controller.getAddress(), amount);

      await expect(controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY))
        .to.emit(controller, "CommitObserve");

      const balanceAfter = await qcat.balanceOf(owner.address);
      expect(balanceBefore - balanceAfter).to.equal(amount);

      const pending = await controller.pending(owner.address);
      expect(pending.amount).to.equal(amount);
      expect(pending.dataHash).to.equal(dataHash);
      expect(pending.active).to.equal(true);
    });

    it("Should work without approval (controller can burn directly)", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      // Controller can burn tokens directly without approval (by design)
      // This is because controller is a privileged contract with burn rights
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      
      // Should succeed and create pending observation
      const pending = await controller.pending(owner.address);
      expect(pending.active).to.equal(true);
      expect(pending.amount).to.equal(amount);
    });

    it("Should revert if already has pending observation", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await qcat.approve(await controller.getAddress(), amount * 2n);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      await expect(
        controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY)
      ).to.be.revertedWithCustomError(controller, "PendingObservationExists");
    });

    it("Should revert if amount is 0", async function () {
      const { controller } = await loadFixture(deployQuantumCatERC20Fixture);

      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await expect(
        controller.commitObserve(0, dataHash, DEFAULT_ENTROPY)
      ).to.be.revertedWithCustomError(controller, "InvalidAmount");
    });

    it("Should revert if entropy is zero", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await qcat.approve(await controller.getAddress(), amount);

      await expect(
        controller.commitObserve(amount, dataHash, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(controller, "ZeroEntropy");
    });

    it("Should revert if insufficient QCAT balance", async function () {
      const { controller, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await expect(
        controller.connect(user1).commitObserve(amount, dataHash, DEFAULT_ENTROPY)
      ).to.be.reverted; // ERC20 insufficient balance
    });
  });

  describe("Observe - Reveal Phase", function () {
    it("Should reveal observation and mint ALIVECAT or DEADCAT", async function () {
      const { qcat, alivecat, deadcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const data = ethers.toUtf8Bytes("test_reveal_data");
      const dataHash = ethers.keccak256(data);

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Mine 5 blocks (REVEAL_DELAY)
      await mine(5);

      await expect(controller.observe(data))
        .to.emit(controller, "Observed");

      // Check that either ALIVECAT or DEADCAT was minted
      const alivecatBalance = await alivecat.balanceOf(owner.address);
      const deadcatBalance = await deadcat.balanceOf(owner.address);

      // Should have received all of one type
      expect(alivecatBalance + deadcatBalance).to.equal(amount);
      expect(alivecatBalance === amount || deadcatBalance === amount).to.be.true;
      expect(alivecatBalance === 0n || deadcatBalance === 0n).to.be.true;

      // Pending should be cleared
      const pending = await controller.pending(owner.address);
      expect(pending.active).to.equal(false);
    });

    it("Should revert if trying to observe before delay", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const data = ethers.toUtf8Bytes("test");
      const dataHash = ethers.keccak256(data);

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Try to observe immediately (without mining blocks)
      await expect(
        controller.observe(data)
      ).to.be.revertedWithCustomError(controller, "InsufficientDelay");
    });

    it("Should revert if no pending observation", async function () {
      const { controller } = await loadFixture(deployQuantumCatERC20Fixture);

      const data = ethers.toUtf8Bytes("test");

      await expect(
        controller.observe(data)
      ).to.be.revertedWithCustomError(controller, "NoPendingObservation");
    });

    it("Should revert if data doesn't match hash", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const data = ethers.toUtf8Bytes("correct_data");
      const wrongData = ethers.toUtf8Bytes("wrong_data");
      const dataHash = ethers.keccak256(data);

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      await mine(5);

      await expect(
        controller.observe(wrongData)
      ).to.be.revertedWithCustomError(controller, "HashMismatch");
    });

    it("Should revert if data is too long", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      // Create data longer than DATA_MAX (256 bytes)
      const longData = new Uint8Array(300);
      const dataHash = ethers.keccak256(longData);

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      await mine(5);

      await expect(
        controller.observe(longData)
      ).to.be.revertedWithCustomError(controller, "DataTooLarge");
    });

    it("Should work with canObserve helper", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const data = ethers.toUtf8Bytes("test");
      const dataHash = ethers.keccak256(data);

      // No pending observation
      expect(await controller.canObserve(owner.address)).to.equal(false);

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Too early
      expect(await controller.canObserve(owner.address)).to.equal(false);

      await mine(5);

      // Now can observe (need one more block since canObserve checks >  not >=)
      await mine(1);
      expect(await controller.canObserve(owner.address)).to.equal(true);

      await controller.observe(data);

      // No longer pending
      expect(await controller.canObserve(owner.address)).to.equal(false);
    });
  });

  describe("Force Observe", function () {
    it("Should allow anyone to force observe after grace period", async function () {
      const { qcat, alivecat, deadcat, controller, owner, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Mine REVEAL_DELAY + GRACE blocks (5 + 64 = 69)
      await mine(69);

      await expect(controller.connect(user1).forceObserve(owner.address))
        .to.emit(controller, "Forced");

      // Check that either ALIVECAT or DEADCAT was minted
      const alivecatBalance = await alivecat.balanceOf(owner.address);
      const deadcatBalance = await deadcat.balanceOf(owner.address);

      expect(alivecatBalance + deadcatBalance).to.equal(amount);
    });

    it("Should revert if trying to force observe too early", async function () {
      const { qcat, controller, owner, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Mine only REVEAL_DELAY blocks (not enough)
      await mine(5);

      await expect(
        controller.connect(user1).forceObserve(owner.address)
      ).to.be.revertedWithCustomError(controller, "GracePeriodNotPassed");
    });

    it("Should revert if no pending observation", async function () {
      const { controller, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      await expect(
        controller.connect(user1).forceObserve(user1.address)
      ).to.be.revertedWithCustomError(controller, "NoPendingObservation");
    });

    it("Should correctly report canForceObserve", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      // No pending observation
      expect(await controller.canForceObserve(owner.address)).to.equal(false);

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Too early (just after commit)
      expect(await controller.canForceObserve(owner.address)).to.equal(false);

      // After reveal delay but before grace
      await mine(5);
      expect(await controller.canForceObserve(owner.address)).to.equal(false);

      // After grace period (need one more block for > condition)
      await mine(64);
      await mine(1);
      expect(await controller.canForceObserve(owner.address)).to.equal(true);
    });
  });

  describe("Rebox", function () {
    async function setupWithObservedTokens() {
      const fixture = await loadFixture(deployQuantumCatERC20Fixture);
      const { qcat, alivecat, deadcat, controller, owner } = fixture;

      // Perform multiple observations to get both ALIVECAT and DEADCAT
      // This is probabilistic, so we'll do it multiple times
      for (let i = 0; i < 10; i++) {
        const amount = ethers.parseEther("100");
        const data = ethers.toUtf8Bytes(`test_${i}`);
        const dataHash = ethers.keccak256(data);
        const entropy = generateEntropy(`rebox_${i}`);

        await qcat.approve(await controller.getAddress(), amount);
        await controller.commitObserve(amount, dataHash, entropy);
        await mine(5);
        await controller.observe(data);

        // Check if we have both types
        const aliveBal = await alivecat.balanceOf(owner.address);
        const deadBal = await deadcat.balanceOf(owner.address);
        if (aliveBal > 0n && deadBal > 0n) {
          break; // We have both types
        }
      }

      return fixture;
    }

    it("Should rebox equal pairs back to QCAT with fee", async function () {
      const { qcat, alivecat, deadcat, controller, owner } = await setupWithObservedTokens();

      const aliveBefore = await alivecat.balanceOf(owner.address);
      const deadBefore = await deadcat.balanceOf(owner.address);
      const qcatBefore = await qcat.balanceOf(owner.address);

      // Only rebox if we have both types
      if (aliveBefore === 0n || deadBefore === 0n) {
        this.skip(); // Skip if we don't have both types
        return;
      }

      const pairs = ethers.parseEther("10");

      // Approve controller to burn both tokens
      await alivecat.approve(await controller.getAddress(), pairs);
      await deadcat.approve(await controller.getAddress(), pairs);

      await expect(controller.rebox(pairs))
        .to.emit(controller, "Reboxed");

      const aliveAfter = await alivecat.balanceOf(owner.address);
      const deadAfter = await deadcat.balanceOf(owner.address);
      const qcatAfter = await qcat.balanceOf(owner.address);

      // Should burn equal amounts of both
      expect(aliveBefore - aliveAfter).to.equal(pairs);
      expect(deadBefore - deadAfter).to.equal(pairs);

      // Should mint QCAT minus fee (5% = 500 bps)
      const expectedQcat = (pairs * 2n * 9500n) / 10000n; // 2 pairs - 5% fee
      expect(qcatAfter - qcatBefore).to.equal(expectedQcat);
    });

    it("Should calculate rebox output correctly", async function () {
      const { controller } = await loadFixture(deployQuantumCatERC20Fixture);

      const pairs = ethers.parseEther("10");
      const [qcatOut, fee] = await controller.calculateReboxOutput(pairs);

      // Expected: 2 * 10 = 20, minus 5% = 19
      expect(qcatOut).to.equal(ethers.parseEther("19"));
      expect(fee).to.equal(ethers.parseEther("1"));
    });

    it("Should revert if pairs is 0", async function () {
      const { controller } = await loadFixture(deployQuantumCatERC20Fixture);

      await expect(
        controller.rebox(0)
      ).to.be.revertedWithCustomError(controller, "NoPairsAvailable");
    });

    it("Should revert if insufficient balance", async function () {
      const { alivecat, deadcat, controller, owner } = await setupWithObservedTokens();

      const pairs = ethers.parseEther("1000000"); // Way more than available

      await alivecat.approve(await controller.getAddress(), pairs);
      await deadcat.approve(await controller.getAddress(), pairs);

      await expect(
        controller.rebox(pairs)
      ).to.be.reverted; // ERC20 insufficient balance
    });

    it("Should work without approval (controller can burn directly)", async function () {
      const { qcat, alivecat, deadcat, controller, owner } = await setupWithObservedTokens();

      const aliveBal = await alivecat.balanceOf(owner.address);
      const deadBal = await deadcat.balanceOf(owner.address);
      
      const pairs = aliveBal < deadBal ? aliveBal : deadBal;

      if (pairs === 0n) {
        this.skip(); // Skip if no pairs available
        return;
      }

      // Controller can burn tokens directly without approval (by design)
      // Rebox should succeed
      await controller.rebox(pairs);
      
      // Should have minted QCAT
      const qcatBal = await qcat.balanceOf(owner.address);
      expect(qcatBal).to.be.gt(0);
    });

    it("Should reboxMax all available pairs", async function () {
      const { qcat, alivecat, deadcat, controller, owner } = await setupWithObservedTokens();

      const aliveBal = await alivecat.balanceOf(owner.address);
      const deadBal = await deadcat.balanceOf(owner.address);
      
      if (aliveBal === 0n || deadBal === 0n) {
        this.skip(); // Skip if no pairs available
        return;
      }

      const qcatBefore = await qcat.balanceOf(owner.address);
      
      // Use staticCall to get the return value without executing
      const pairs = await controller.reboxMax.staticCall(0); // 0 = no cap
      expect(pairs).to.be.gt(0);
      
      // Now actually execute the transaction
      await controller.reboxMax(0);
      
      // Should have minted QCAT
      const qcatAfter = await qcat.balanceOf(owner.address);
      expect(qcatAfter).to.be.gt(qcatBefore);
    });

    it("Should reboxMax with cap parameter", async function () {
      const { qcat, alivecat, deadcat, controller, owner } = await setupWithObservedTokens();

      const aliveBal = await alivecat.balanceOf(owner.address);
      const deadBal = await deadcat.balanceOf(owner.address);
      
      if (aliveBal < ethers.parseEther("5") || deadBal < ethers.parseEther("5")) {
        this.skip(); // Skip if insufficient pairs
        return;
      }

      const cap = ethers.parseEther("5");
      
      // Use staticCall to get the return value
      const pairs = await controller.reboxMax.staticCall(cap);
      
      // Should respect the cap
      expect(pairs).to.be.lte(cap);
      
      // Execute the actual transaction
      await controller.reboxMax(cap);
    });
  });

  describe("Multiple Users", function () {
    it("Should handle observations from different users independently", async function () {
      const { qcat, alivecat, deadcat, controller, owner, user1, user2 } = await loadFixture(deployQuantumCatERC20Fixture);

      // Transfer QCAT to users
      await qcat.transfer(user1.address, ethers.parseEther("1000"));
      await qcat.transfer(user2.address, ethers.parseEther("1000"));

      // User1 commits
      const amount1 = ethers.parseEther("100");
      const data1 = ethers.toUtf8Bytes("user1_data");
      const dataHash1 = ethers.keccak256(data1);
      await qcat.connect(user1).approve(await controller.getAddress(), amount1);
      await controller.connect(user1).commitObserve(amount1, dataHash1, DEFAULT_ENTROPY);

      // User2 commits
      const amount2 = ethers.parseEther("200");
      const data2 = ethers.toUtf8Bytes("user2_data");
      const dataHash2 = ethers.keccak256(data2);
      await qcat.connect(user2).approve(await controller.getAddress(), amount2);
      await controller.connect(user2).commitObserve(amount2, dataHash2, generateEntropy("user2"));

      await mine(5);

      // User1 observes
      await controller.connect(user1).observe(data1);
      const user1Alive = await alivecat.balanceOf(user1.address);
      const user1Dead = await deadcat.balanceOf(user1.address);
      expect(user1Alive + user1Dead).to.equal(amount1);

      // User2 observes
      await controller.connect(user2).observe(data2);
      const user2Alive = await alivecat.balanceOf(user2.address);
      const user2Dead = await deadcat.balanceOf(user2.address);
      expect(user2Alive + user2Dead).to.equal(amount2);
    });
  });

  describe("ERC-20 Standard Compliance", function () {
    it("Should allow transfer of QCAT", async function () {
      const { qcat, owner, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      await qcat.transfer(user1.address, amount);

      expect(await qcat.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should allow approve and transferFrom", async function () {
      const { qcat, owner, user1, user2 } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      await qcat.approve(user1.address, amount);

      await qcat.connect(user1).transferFrom(owner.address, user2.address, amount);

      expect(await qcat.balanceOf(user2.address)).to.equal(amount);
    });

    it("Should emit Transfer events", async function () {
      const { qcat, owner, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");

      await expect(qcat.transfer(user1.address, amount))
        .to.emit(qcat, "Transfer")
        .withArgs(owner.address, user1.address, amount);
    });

    it("Should allow trading ALIVECAT after observation", async function () {
      const { qcat, alivecat, controller, owner, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      // Observe to get ALIVECAT or DEADCAT
      const amount = ethers.parseEther("100");
      const data = ethers.toUtf8Bytes("test");
      const dataHash = ethers.keccak256(data);

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(5);
      await controller.observe(data);

      // If we got ALIVECAT, transfer it
      const aliveBalance = await alivecat.balanceOf(owner.address);
      if (aliveBalance > 0n) {
        await alivecat.transfer(user1.address, ethers.parseEther("10"));
        expect(await alivecat.balanceOf(user1.address)).to.equal(ethers.parseEther("10"));
      }
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-controller from minting QCAT", async function () {
      const { qcat, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      await expect(
        qcat.connect(user1).mint(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(qcat, "OnlyController");
    });

    it("Should prevent non-controller from burning QCAT", async function () {
      const { qcat, owner, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      await expect(
        qcat.connect(user1).burn(owner.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(qcat, "OnlyController");
    });

    it("Should prevent non-controller from minting ALIVECAT", async function () {
      const { alivecat, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      await expect(
        alivecat.connect(user1).mint(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(alivecat, "OnlyController");
    });

    it("Should prevent non-controller from minting DEADCAT", async function () {
      const { deadcat, user1 } = await loadFixture(deployQuantumCatERC20Fixture);

      await expect(
        deadcat.connect(user1).mint(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(deadcat, "OnlyController");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very large amounts", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const largeAmount = ethers.parseEther("100000");
      const data = ethers.toUtf8Bytes("large_test");
      const dataHash = ethers.keccak256(data);

      await qcat.approve(await controller.getAddress(), largeAmount);
      await controller.commitObserve(largeAmount, dataHash, DEFAULT_ENTROPY);
      await mine(5);
      await controller.observe(data);

      // Should succeed without overflow
    });

    it("Should handle very small amounts", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const smallAmount = 1n; // 1 wei
      const data = ethers.toUtf8Bytes("small_test");
      const dataHash = ethers.keccak256(data);

      await qcat.approve(await controller.getAddress(), smallAmount);
      await controller.commitObserve(smallAmount, dataHash, DEFAULT_ENTROPY);
      await mine(5);
      await controller.observe(data);

      // Should succeed
    });

    it("Should handle maximum data length", async function () {
      const { qcat, controller, owner } = await loadFixture(deployQuantumCatERC20Fixture);

      const amount = ethers.parseEther("100");
      const maxData = new Uint8Array(256); // Exactly DATA_MAX
      for (let i = 0; i < 256; i++) {
        maxData[i] = i % 256;
      }
      const dataHash = ethers.keccak256(maxData);

      await qcat.approve(await controller.getAddress(), amount);
      await controller.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(5);
      await controller.observe(maxData);

      // Should succeed at exactly the limit
    });
  });
});

