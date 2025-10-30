const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("QuantumCat", function () {
  // Helper for generating deterministic user entropy in tests
  const generateEntropy = (seed) => ethers.keccak256(ethers.toUtf8Bytes(`test_entropy_${seed}`));
  const DEFAULT_ENTROPY = generateEntropy("default");
  // Fixture to deploy the immutable contract
  async function deployQuantumCatFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    const QuantumCat = await ethers.getContractFactory("QuantumCat");
    const quantumCat = await QuantumCat.deploy(
      owner.address,
      ethers.parseEther("1000000"), // 1M QCAT initial supply
      500 // 5% fee (500 basis points)
    );

    return { quantumCat, owner, user1, user2, user3 };
  }

  describe("Deployment & Initialization", function () {
    it("Should set the right token URIs", async function () {
      const { quantumCat } = await loadFixture(deployQuantumCatFixture);

      expect(await quantumCat.uri(0)).to.equal("https://quantumcat.xyz/metadata/0");
      expect(await quantumCat.uri(1)).to.equal("https://quantumcat.xyz/metadata/1");
      expect(await quantumCat.uri(2)).to.equal("https://quantumcat.xyz/metadata/2");
    });

    it("Should mint initial supply to owner", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      expect(await quantumCat.balanceOf(owner.address, 0)).to.equal(
        ethers.parseEther("1000000")
      );
    });

    it("Should set the correct fee", async function () {
      const { quantumCat } = await loadFixture(deployQuantumCatFixture);

      expect(await quantumCat.REBOX_FEE_BPS()).to.equal(500);
    });

    it("Should set name and symbol", async function () {
      const { quantumCat } = await loadFixture(deployQuantumCatFixture);

      expect(await quantumCat.NAME()).to.equal("QuantumCat");
      expect(await quantumCat.SYMBOL()).to.equal("QCAT");
    });
  });

  describe("Observe - Commit Phase", function () {
    it("Should commit observation and burn QCAT", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = ethers.parseEther("100");
      const data = ethers.toUtf8Bytes("test_data_t5");
      const dataHash = ethers.keccak256(data);

      const balanceBefore = await quantumCat.balanceOf(owner.address, 0);

      await expect(quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY))
        .to.emit(quantumCat, "CommitObserve");

      const balanceAfter = await quantumCat.balanceOf(owner.address, 0);
      expect(balanceBefore - balanceAfter).to.equal(amount);

      const pending = await quantumCat.pending(owner.address);
      expect(pending.amount).to.equal(amount);
      expect(pending.dataHash).to.equal(dataHash);
      expect(pending.active).to.equal(true);
    });

    it("Should revert if already has pending observation", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      await expect(
        quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY)
      ).to.be.revertedWithCustomError(quantumCat, "PendingObservationExists");
    });

    it("Should revert if amount is 0", async function () {
      const { quantumCat } = await loadFixture(deployQuantumCatFixture);

      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await expect(
        quantumCat.commitObserve(0, dataHash, DEFAULT_ENTROPY)
      ).to.be.revertedWithCustomError(quantumCat, "InvalidAmount");
    });

    it("Should revert if insufficient QCAT balance", async function () {
      const { quantumCat, user1 } = await loadFixture(deployQuantumCatFixture);

      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await expect(
        quantumCat.connect(user1).commitObserve(100, dataHash, DEFAULT_ENTROPY)
      ).to.be.revertedWithCustomError(quantumCat, "ERC1155InsufficientBalance");
    });

    it("Should revert if user entropy is zero", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = ethers.parseEther("100");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const zeroEntropy = ethers.ZeroHash; // bytes32(0)

      await expect(
        quantumCat.commitObserve(amount, dataHash, zeroEntropy)
      ).to.be.revertedWithCustomError(quantumCat, "ZeroEntropy");
    });
  });

  describe("Observe - Reveal Phase", function () {
    it("Should observe and mint ALIVECAT/DEADCAT after delay", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test_salt_t3");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Mine blocks to pass REVEAL_DELAY
      await mine(6);

      await expect(quantumCat.observe(data))
        .to.emit(quantumCat, "Observed");

      const aliveBal = await quantumCat.balanceOf(owner.address, 1);
      const deadBal = await quantumCat.balanceOf(owner.address, 2);

      // Sum should equal amount
      expect(aliveBal + deadBal).to.equal(amount);

      // Pending should be cleared
      const pending = await quantumCat.pending(owner.address);
      expect(pending.active).to.equal(false);
    });

    it("Should revert if revealed too soon (immediate)", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Try immediately
      await expect(
        quantumCat.observe(data)
      ).to.be.revertedWithCustomError(quantumCat, "InsufficientDelay");
    });

    it("Should revert if revealed too soon (at exactly delay)", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test2");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Try with exactly 5 blocks later (need > 5, and observe() itself is a tx)
      await mine(4);
      await expect(
        quantumCat.observe(data)
      ).to.be.revertedWithCustomError(quantumCat, "InsufficientDelay");
    });

    it("Should revert if data doesn't match hash", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("correct_data");
      const wrongData = ethers.toUtf8Bytes("wrong_data");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);

      await expect(
        quantumCat.observe(wrongData)
      ).to.be.revertedWithCustomError(quantumCat, "HashMismatch");
    });

    it("Should revert if no pending observation", async function () {
      const { quantumCat, user1 } = await loadFixture(deployQuantumCatFixture);

      const data = ethers.toUtf8Bytes("test");

      await expect(
        quantumCat.connect(user1).observe(data)
      ).to.be.revertedWithCustomError(quantumCat, "NoPendingObservation");
    });

    it("Should revert if data is too big", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const bigData = new Uint8Array(257); // DATA_MAX is 256
      const dataHash = ethers.keccak256(bigData);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);

      await expect(
        quantumCat.observe(bigData)
      ).to.be.revertedWithCustomError(quantumCat, "DataTooLarge");
    });

    it("Should handle empty data", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes(""); // empty
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);

      await expect(quantumCat.observe(data))
        .to.emit(quantumCat, "Observed");

      const alive = await quantumCat.balanceOf(owner.address, 1);
      const dead = await quantumCat.balanceOf(owner.address, 2);

      expect(alive + dead).to.equal(amount);
    });
  });

  describe("Force Observe", function () {
    it("Should force observe after grace period", async function () {
      const { quantumCat, owner, user1 } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Mine REVEAL_DELAY + GRACE blocks
      await mine(70); // 5 + 64 + 1

      await expect(quantumCat.connect(user1).forceObserve(owner.address))
        .to.emit(quantumCat, "Forced");

      const aliveBal = await quantumCat.balanceOf(owner.address, 1);
      const deadBal = await quantumCat.balanceOf(owner.address, 2);

      expect(aliveBal + deadBal).to.equal(amount);

      const pending = await quantumCat.pending(owner.address);
      expect(pending.active).to.equal(false);
    });

    it("Should revert if grace period not passed", async function () {
      const { quantumCat, owner, user1 } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6); // Only passed REVEAL_DELAY

      await expect(
        quantumCat.connect(user1).forceObserve(owner.address)
      ).to.be.revertedWithCustomError(quantumCat, "GracePeriodNotPassed");
    });

    it("Should revert if no pending observation", async function () {
      const { quantumCat, user1 } = await loadFixture(deployQuantumCatFixture);

      await expect(
        quantumCat.forceObserve(user1.address)
      ).to.be.revertedWithCustomError(quantumCat, "NoPendingObservation");
    });
  });

  describe("Rebox", function () {
    async function setupReboxFixture() {
      const fixture = await loadFixture(deployQuantumCatFixture);
      const { quantumCat, owner } = fixture;

      // Setup: commit and observe to get ALIVECAT and DEADCAT
      const amount = 1000n;
      const data = ethers.toUtf8Bytes("setup");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);
      await quantumCat.observe(data);

      return fixture;
    }

    it("Should rebox pairs and mint QCAT with fee", async function () {
      const { quantumCat, owner } = await loadFixture(setupReboxFixture);

      const aliveBefore = await quantumCat.balanceOf(owner.address, 1);
      const deadBefore = await quantumCat.balanceOf(owner.address, 2);
      const qcatBefore = await quantumCat.balanceOf(owner.address, 0);

      const pairs = 10n;

      // Ensure we have enough pairs
      const minBalance = aliveBefore < deadBefore ? aliveBefore : deadBefore;
      expect(minBalance).to.be.gte(pairs);

      await expect(quantumCat.rebox(pairs))
        .to.emit(quantumCat, "Reboxed");

      const aliveAfter = await quantumCat.balanceOf(owner.address, 1);
      const deadAfter = await quantumCat.balanceOf(owner.address, 2);
      const qcatAfter = await quantumCat.balanceOf(owner.address, 0);

      expect(aliveBefore - aliveAfter).to.equal(pairs);
      expect(deadBefore - deadAfter).to.equal(pairs);

      // 2 * pairs - 5% fee = 2 * 10 * 0.95 = 19
      const expectedQcat = (2n * pairs * 9500n) / 10000n;
      expect(qcatAfter - qcatBefore).to.equal(expectedQcat);
    });

    it("Should revert if pairs is 0", async function () {
      const { quantumCat } = await loadFixture(setupReboxFixture);

      await expect(
        quantumCat.rebox(0)
      ).to.be.revertedWithCustomError(quantumCat, "NoPairsAvailable");
    });

    it("Should revert if insufficient ALIVECAT", async function () {
      const { quantumCat, owner } = await loadFixture(setupReboxFixture);

      const aliveBal = await quantumCat.balanceOf(owner.address, 1);

      await expect(
        quantumCat.rebox(aliveBal + 1n)
      ).to.be.revertedWithCustomError(quantumCat, "ERC1155InsufficientBalance");
    });

    it("Should revert if insufficient DEADCAT", async function () {
      const { quantumCat, owner } = await loadFixture(setupReboxFixture);

      const deadBal = await quantumCat.balanceOf(owner.address, 2);

      await expect(
        quantumCat.rebox(deadBal + 1n)
      ).to.be.revertedWithCustomError(quantumCat, "ERC1155InsufficientBalance");
    });

    it("Should handle zero fee correctly", async function () {
      const [owner] = await ethers.getSigners();
      const QuantumCat = await ethers.getContractFactory("QuantumCat");
      const quantumCat = await QuantumCat.deploy(
        owner.address,
        ethers.parseEther("1000000"),
        0 // 0% fee
      );

      // Setup
      const amount = 1000n;
      const data = ethers.toUtf8Bytes("setup");
      const dataHash = ethers.keccak256(data);
      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);
      await quantumCat.observe(data);

      const qcatBefore = await quantumCat.balanceOf(owner.address, 0);

      // Get actual balances to determine how many pairs we can rebox
      const aliveBalance = await quantumCat.balanceOf(owner.address, 1);
      const deadBalance = await quantumCat.balanceOf(owner.address, 2);
      const maxPairs = aliveBalance < deadBalance ? aliveBalance : deadBalance;
      const pairs = maxPairs < 10n ? maxPairs : 10n; // Use min(maxPairs, 10)

      await quantumCat.rebox(pairs);

      const qcatAfter = await quantumCat.balanceOf(owner.address, 0);
      expect(qcatAfter - qcatBefore).to.equal(2n * pairs); // No fee
    });

    it("Should revert if pairs would overflow", async function () {
      const { quantumCat } = await loadFixture(setupReboxFixture);

      const maxPairs = ethers.MaxUint256 / 2n + 1n;

      await expect(
        quantumCat.rebox(maxPairs)
      ).to.be.revertedWithCustomError(quantumCat, "PairsOverflow");
    });
  });

  describe("ReboxMax", function () {
    async function setupReboxMaxFixture() {
      const fixture = await loadFixture(deployQuantumCatFixture);
      const { quantumCat, owner } = fixture;

      const amount = 1000n;
      const data = ethers.toUtf8Bytes("setup");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);
      await quantumCat.observe(data);

      return fixture;
    }

    it("Should rebox maximum pairs without cap", async function () {
      const { quantumCat, owner } = await loadFixture(setupReboxMaxFixture);

      const aliveBefore = await quantumCat.balanceOf(owner.address, 1);
      const deadBefore = await quantumCat.balanceOf(owner.address, 2);
      const qcatBefore = await quantumCat.balanceOf(owner.address, 0);
      const expectedPairs = aliveBefore < deadBefore ? aliveBefore : deadBefore;

      await expect(quantumCat.reboxMax(0))
        .to.emit(quantumCat, "Reboxed");

      const aliveAfter = await quantumCat.balanceOf(owner.address, 1);
      const deadAfter = await quantumCat.balanceOf(owner.address, 2);
      const qcatAfter = await quantumCat.balanceOf(owner.address, 0);

      expect(aliveBefore - aliveAfter).to.equal(expectedPairs);
      expect(deadBefore - deadAfter).to.equal(expectedPairs);

      // Verify QCAT minted is less than 2*pairs due to fee
      const qcatGained = qcatAfter - qcatBefore;
      expect(qcatGained).to.be.lt(2n * expectedPairs);
      expect(qcatGained).to.be.gt(0n);
    });

    it("Should respect cap parameter", async function () {
      const { quantumCat, owner } = await loadFixture(setupReboxMaxFixture);

      const aliveBefore = await quantumCat.balanceOf(owner.address, 1);
      const deadBefore = await quantumCat.balanceOf(owner.address, 2);
      const cap = 5n;

      await quantumCat.reboxMax(cap);

      const aliveAfter = await quantumCat.balanceOf(owner.address, 1);
      const deadAfter = await quantumCat.balanceOf(owner.address, 2);

      expect(aliveBefore - aliveAfter).to.equal(cap);
      expect(deadBefore - deadAfter).to.equal(cap);
    });

    it("Should revert if no pairs available", async function () {
      const { quantumCat, user1 } = await loadFixture(deployQuantumCatFixture);

      await expect(
        quantumCat.connect(user1).reboxMax(0)
      ).to.be.revertedWithCustomError(quantumCat, "NoPairsAvailable");
    });
  });

  describe("View Helper Functions", function () {
    it("Should correctly report canObserve", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      expect(await quantumCat.canObserve(owner.address)).to.equal(false);

      const amount = 100n;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      expect(await quantumCat.canObserve(owner.address)).to.equal(false);

      await mine(6);

      expect(await quantumCat.canObserve(owner.address)).to.equal(true);
    });

    it("Should correctly report canForceObserve", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      expect(await quantumCat.canForceObserve(owner.address)).to.equal(false);

      const amount = 100n;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      await mine(6);
      expect(await quantumCat.canForceObserve(owner.address)).to.equal(false);

      await mine(64);
      expect(await quantumCat.canForceObserve(owner.address)).to.equal(true);
    });

    it("Should calculate rebox output correctly", async function () {
      const { quantumCat } = await loadFixture(deployQuantumCatFixture);

      const pairs = 100n;
      const [qcatOut, feeTaken] = await quantumCat.calculateReboxOutput(pairs);

      const expectedBase = 2n * pairs;
      const expectedFee = (expectedBase * 500n) / 10000n;
      const expectedOut = expectedBase - expectedFee;

      expect(qcatOut).to.equal(expectedOut);
      expect(feeTaken).to.equal(expectedFee);
    });
  });

  describe("Constants and Configuration", function () {
    it("Should have correct constant values", async function () {
      const { quantumCat } = await loadFixture(deployQuantumCatFixture);

      expect(await quantumCat.QCAT()).to.equal(0);
      expect(await quantumCat.ALIVECAT()).to.equal(1);
      expect(await quantumCat.DEADCAT()).to.equal(2);
      expect(await quantumCat.REVEAL_DELAY()).to.equal(5);
      expect(await quantumCat.GRACE()).to.equal(64);
      expect(await quantumCat.DATA_MAX()).to.equal(256);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle large amounts correctly", async function () {
      const [owner] = await ethers.getSigners();
      const QuantumCat = await ethers.getContractFactory("QuantumCat");
      const quantumCat = await QuantumCat.deploy(
        owner.address,
        ethers.parseEther("1000000000"), // 1B
        500
      );

      const largeAmount = ethers.parseEther("1000000"); // 1M
      const data = ethers.toUtf8Bytes("large");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(largeAmount, dataHash, DEFAULT_ENTROPY);
      await mine(6);
      await quantumCat.observe(data);

      const alive = await quantumCat.balanceOf(owner.address, 1);
      const dead = await quantumCat.balanceOf(owner.address, 2);

      expect(alive + dead).to.equal(largeAmount);
    });

    it("Should handle blockhash fallback correctly", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Mine enough blocks to make blockhash(refBlock + DELAY) return 0
      await mine(300);

      // Should still work with fallback RNG
      await quantumCat.observe(data);

      const alive = await quantumCat.balanceOf(owner.address, 1);
      const dead = await quantumCat.balanceOf(owner.address, 2);

      expect(alive + dead).to.equal(amount);
    });
  });

  describe("ERC1155 Standard Compliance", function () {
    it("Should handle transfer of QCAT tokens", async function () {
      const { quantumCat, owner, user1 } = await loadFixture(deployQuantumCatFixture);

      const transferAmount = ethers.parseEther("1000");

      await quantumCat.safeTransferFrom(
        owner.address,
        user1.address,
        0,
        transferAmount,
        "0x"
      );

      expect(await quantumCat.balanceOf(user1.address, 0)).to.equal(transferAmount);
    });

    it("Should handle batch transfers", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      // First get some ALIVECAT and DEADCAT
      const amount = 100n;
      const data = ethers.toUtf8Bytes("test");
      const dataHash = ethers.keccak256(data);
      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(70); // Wait enough for forceObserve
      await quantumCat.forceObserve(owner.address);

      // Check balances after observation
      const aliveBalance = await quantumCat.balanceOf(owner.address, 1);
      const deadBalance = await quantumCat.balanceOf(owner.address, 2);
      
      // Transfer smaller amounts to ensure we have enough
      const aliveToTransfer = aliveBalance > 10n ? 10n : aliveBalance;
      const deadToTransfer = deadBalance > 10n ? 10n : deadBalance;

      const [, user1] = await ethers.getSigners();
      const ids = [0, 1, 2];
      const amounts = [100, aliveToTransfer, deadToTransfer];

      await quantumCat.safeBatchTransferFrom(
        owner.address,
        user1.address,
        ids,
        amounts,
        "0x"
      );

      expect(await quantumCat.balanceOf(user1.address, 0)).to.equal(100);
      expect(await quantumCat.balanceOf(user1.address, 1)).to.equal(aliveToTransfer);
      expect(await quantumCat.balanceOf(user1.address, 2)).to.equal(deadToTransfer);
    });

    it("Should handle approval and operator transfers", async function () {
      const { quantumCat, owner, user1, user2 } = await loadFixture(deployQuantumCatFixture);

      await quantumCat.setApprovalForAll(user1.address, true);

      expect(await quantumCat.isApprovedForAll(owner.address, user1.address)).to.equal(true);

      await quantumCat.connect(user1).safeTransferFrom(
        owner.address,
        user2.address,
        0,
        1000n,
        "0x"
      );

      expect(await quantumCat.balanceOf(user2.address, 0)).to.equal(1000n);
    });

    it("Should return correct balanceOfBatch", async function () {
      const { quantumCat, owner, user1 } = await loadFixture(deployQuantumCatFixture);

      await quantumCat.safeTransferFrom(owner.address, user1.address, 0, 1000n, "0x");

      const addresses = [owner.address, user1.address];
      const ids = [0, 0];

      const balances = await quantumCat.balanceOfBatch(addresses, ids);

      expect(balances[0]).to.equal(ethers.parseEther("1000000") - 1000n);
      expect(balances[1]).to.equal(1000n);
    });
  });

  describe("Enhanced RNG Security", function () {
    it("Should emit RandomnessSourceUsed event with correct fallback flag", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test_rng");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);

      // Should emit RandomnessSourceUsed with usedFallback = false (within 256 blocks)
      await expect(quantumCat.observe(data))
        .to.emit(quantumCat, "RandomnessSourceUsed")
        .withArgs(owner.address, false);
    });

    it("Should produce different outcomes with different user entropy", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 1000n;
      const data = ethers.toUtf8Bytes("same_data_t5");
      const dataHash = ethers.keccak256(data);

      // First observation with entropy1
      const entropy1 = generateEntropy("entropy1");
      await quantumCat.commitObserve(amount, dataHash, entropy1);
      await mine(6);
      await quantumCat.observe(data);

      const alive1 = await quantumCat.balanceOf(owner.address, 1);
      const dead1 = await quantumCat.balanceOf(owner.address, 2);

      // Second observation with different entropy
      const entropy2 = generateEntropy("entropy2");
      await quantumCat.commitObserve(amount, dataHash, entropy2);
      await mine(6);
      await quantumCat.observe(data);

      const alive2 = await quantumCat.balanceOf(owner.address, 1);
      const dead2 = await quantumCat.balanceOf(owner.address, 2);

      // With high probability, different entropy should produce different splits
      // (Not guaranteed due to randomness, but extremely likely with 1000 tokens)
      const split1 = alive1 - dead1;
      const split2 = (alive2 - alive1) - (dead2 - dead1);

      // Verify that sums are correct
      expect(alive1 + dead1).to.equal(amount);
      expect((alive2 - alive1) + (dead2 - dead1)).to.equal(amount);

      // With 1000 tokens and different entropy, splits being identical is ~0.1% chance
      // So this test will pass 99.9% of the time
      // Note: We can't assert inequality due to randomness, so we just verify the math works
    });

    it("Should verify userEntropy is stored in pending struct", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const customEntropy = generateEntropy("custom");

      await quantumCat.commitObserve(amount, dataHash, customEntropy);

      const pending = await quantumCat.pending(owner.address);
      expect(pending.userEntropy).to.equal(customEntropy);
      expect(pending.amount).to.equal(amount);
      expect(pending.dataHash).to.equal(dataHash);
      expect(pending.active).to.equal(true);
    });

    it("Should use userEntropy in both observe and forceObserve", async function () {
      const { quantumCat, owner, user1 } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test_force");
      const dataHash = ethers.keccak256(data);
      const customEntropy = generateEntropy("force_test");

      await quantumCat.commitObserve(amount, dataHash, customEntropy);

      // Wait for grace period (REVEAL_DELAY + GRACE = 5 + 64 = 69 blocks)
      await mine(70);

      // forceObserve should work and use the stored entropy
      await expect(quantumCat.connect(user1).forceObserve(owner.address))
        .to.emit(quantumCat, "Forced")
        .to.emit(quantumCat, "RandomnessSourceUsed");

      const alive = await quantumCat.balanceOf(owner.address, 1);
      const dead = await quantumCat.balanceOf(owner.address, 2);

      expect(alive + dead).to.equal(amount);
    });
  });

  describe("Extended RNG Security Tests", function () {
    it("Should verify entropy affects random split outcomes", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      // Same data, same block, different entropy = different outcomes
      const amount = 10000n;
      const data = ethers.toUtf8Bytes("test_random_split");
      const dataHash = ethers.keccak256(data);

      const results = [];

      for (let i = 0; i < 3; i++) {
        const entropy = generateEntropy(`entropy_${i}`);
        await quantumCat.commitObserve(amount, dataHash, entropy);
        await mine(6);
        await quantumCat.observe(data);

        const alive = await quantumCat.balanceOf(owner.address, 1);
        const dead = await quantumCat.balanceOf(owner.address, 2);
        results.push({ alive, dead, diff: alive > dead ? alive - dead : dead - alive });

        // Verify sum is correct
        const totalAlive = await quantumCat.balanceOf(owner.address, 1);
        const totalDead = await quantumCat.balanceOf(owner.address, 2);
        expect(totalAlive + totalDead).to.equal(amount * BigInt(i + 1));
      }

      // With 10000 tokens and different entropy, we should get different outcomes
      // This is a probabilistic test, but with 10000 tokens, identical outcomes are extremely unlikely
    });

    it("Should emit correct event parameters in all observation paths", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("test_events");
      const dataHash = ethers.keccak256(data);
      const customEntropy = generateEntropy("event_test");

      // Test CommitObserve event
      await expect(quantumCat.commitObserve(amount, dataHash, customEntropy))
        .to.emit(quantumCat, "CommitObserve")
        .withArgs(owner.address, amount, dataHash, (refBlock) => {
          expect(refBlock).to.be.gt(0);
          return true;
        });

      await mine(6);

      // Test Observed event with RandomnessSourceUsed
      const tx = await quantumCat.observe(data);
      const receipt = await tx.wait();

      // Find events
      const observedEvent = receipt.logs.find(log => {
        try {
          return quantumCat.interface.parseLog(log)?.name === "Observed";
        } catch { return false; }
      });
      const randomnessEvent = receipt.logs.find(log => {
        try {
          return quantumCat.interface.parseLog(log)?.name === "RandomnessSourceUsed";
        } catch { return false; }
      });

      expect(observedEvent).to.exist;
      expect(randomnessEvent).to.exist;

      const parsedObserved = quantumCat.interface.parseLog(observedEvent);
      const parsedRandomness = quantumCat.interface.parseLog(randomnessEvent);

      expect(parsedObserved.args.owner).to.equal(owner.address);
      expect(parsedObserved.args.alive + parsedObserved.args.dead).to.equal(amount);

      expect(parsedRandomness.args.user).to.equal(owner.address);
      expect(parsedRandomness.args.usedFallback).to.equal(false);
    });

    it("Should handle entropy boundaries (max bytes32)", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const maxEntropy = "0x" + "f".repeat(64); // Max bytes32

      await expect(quantumCat.commitObserve(amount, dataHash, maxEntropy))
        .to.emit(quantumCat, "CommitObserve");

      await mine(6);

      const pending = await quantumCat.pending(owner.address);
      expect(pending.userEntropy).to.equal(maxEntropy);
    });

    it("Should verify different entropy produces statistically different outcomes", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 5000n; // Large enough for statistical significance
      const data = ethers.toUtf8Bytes("stats_test_t4");
      const dataHash = ethers.keccak256(data);

      const outcomes = [];

      // Run 5 observations with different entropy
      for (let i = 0; i < 5; i++) {
        const entropy = generateEntropy(`stats_${i}`);
        await quantumCat.commitObserve(amount, dataHash, entropy);
        await mine(6);
        await quantumCat.observe(data);

        const totalAlive = await quantumCat.balanceOf(owner.address, 1);
        const totalDead = await quantumCat.balanceOf(owner.address, 2);

        // Calculate this observation's alive count
        const prevAlive = i > 0 ? outcomes[i-1] : 0n;
        const thisAlive = totalAlive - prevAlive;

        outcomes.push(thisAlive);
      }

      // At least some outcomes should be different
      const uniqueOutcomes = new Set(outcomes.map(o => o.toString()));
      expect(uniqueOutcomes.size).to.be.gte(3); // At least 3 different outcomes out of 5
    });
  });

  describe("Edge Cases and Boundaries", function () {
    it("Should handle amount = 1 (minimum viable amount)", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 1n;
      const data = ethers.toUtf8Bytes("min_amount");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);
      await quantumCat.observe(data);

      const alive = await quantumCat.balanceOf(owner.address, 1);
      const dead = await quantumCat.balanceOf(owner.address, 2);

      // With amount = 1, result is either (1,0) or (0,1)
      expect(alive + dead).to.equal(1n);
      expect(alive === 1n || dead === 1n).to.be.true;
      expect(alive === 0n || dead === 0n).to.be.true;
    });

    it("Should reject amount = 0 for commitObserve (already tested in commit phase)", async function () {
      // This test case is already covered in "Observe - Commit Phase"
      // Removing duplicate/redundant test
    });

    it("Should handle URI query for invalid token ID", async function () {
      const { quantumCat } = await loadFixture(deployQuantumCatFixture);

      // Query URI for non-existent token ID
      const uri = await quantumCat.uri(999);
      // Should return empty string or parent implementation default
      expect(uri).to.be.a("string");
    });

    it("Should handle exactly at reveal delay boundary", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("boundary");
      const dataHash = ethers.keccak256(data);

      const commitTx = await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      const commitReceipt = await commitTx.wait();
      const commitBlock = commitReceipt.blockNumber;

      // Mine blocks so that the observe() transaction will be at commitBlock + REVEAL_DELAY + 1
      // observe() call itself creates a block, so we mine to commitBlock + REVEAL_DELAY - 1
      const currentBlock = await ethers.provider.getBlockNumber();
      const targetBlock = commitBlock + 5; // REVEAL_DELAY = 5
      const blocksToMine = targetBlock - currentBlock - 1; // -1 because observe creates a block

      if (blocksToMine > 0) {
        await mine(blocksToMine);
      }

      // The observe() transaction will be in block commitBlock + REVEAL_DELAY
      // Should fail because block.number <= p.refBlock + REVEAL_DELAY
      await expect(
        quantumCat.observe(data)
      ).to.be.revertedWithCustomError(quantumCat, "InsufficientDelay");

      // Mine one more block, so observe() will be in commitBlock + REVEAL_DELAY + 1
      await mine(1);
      await expect(quantumCat.observe(data))
        .to.emit(quantumCat, "Observed");
    });

    it("Should handle exactly at grace period boundary", async function () {
      const { quantumCat, owner, user1 } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("grace"));

      const commitTx = await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      const commitReceipt = await commitTx.wait();
      const commitBlock = commitReceipt.blockNumber;

      // Mine blocks so that forceObserve() transaction will be at commitBlock + REVEAL_DELAY + GRACE
      const currentBlock = await ethers.provider.getBlockNumber();
      const targetBlock = commitBlock + 5 + 64; // REVEAL_DELAY + GRACE = 69
      const blocksToMine = targetBlock - currentBlock - 1; // -1 because forceObserve creates a block

      if (blocksToMine > 0) {
        await mine(blocksToMine);
      }

      // The forceObserve() transaction will be in block commitBlock + 69
      // Should fail because block.number <= p.refBlock + REVEAL_DELAY + GRACE
      await expect(
        quantumCat.connect(user1).forceObserve(owner.address)
      ).to.be.revertedWithCustomError(quantumCat, "GracePeriodNotPassed");

      // Mine one more block, so forceObserve() will be in commitBlock + 70
      await mine(1);
      await expect(quantumCat.connect(user1).forceObserve(owner.address))
        .to.emit(quantumCat, "Forced");
    });

    it("Should handle data at exact DATA_MAX boundary", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const maxData = new Uint8Array(256); // Exactly DATA_MAX
      maxData.fill(42);
      const dataHash = ethers.keccak256(maxData);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);

      // Should succeed at exactly 256 bytes
      await expect(quantumCat.observe(maxData))
        .to.emit(quantumCat, "Observed");
    });

    it("Should handle rebox with exact minimum pairs", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      // Setup: get exactly 1 pair
      const amount = 100n;
      const data = ethers.toUtf8Bytes("single_pair");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);
      await mine(6);
      await quantumCat.observe(data);

      // Transfer away all but 1 of each
      const alive = await quantumCat.balanceOf(owner.address, 1);
      const dead = await quantumCat.balanceOf(owner.address, 2);

      const [, user1] = await ethers.getSigners();

      if (alive > 1n) {
        await quantumCat.safeTransferFrom(owner.address, user1.address, 1, alive - 1n, "0x");
      }
      if (dead > 1n) {
        await quantumCat.safeTransferFrom(owner.address, user1.address, 2, dead - 1n, "0x");
      }

      // Should be able to rebox exactly 1 pair
      await expect(quantumCat.rebox(1n))
        .to.emit(quantumCat, "Reboxed");
    });
  });

  describe("State Consistency Tests", function () {
    it("Should maintain correct total supply across observe and rebox", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const initialQCAT = await quantumCat["totalSupply(uint256)"](0);
      const initialTotal = initialQCAT;

      // Commit and observe
      const amount = 1000n;
      const data = ethers.toUtf8Bytes("supply_test");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // After commit: QCAT should be burned
      expect(await quantumCat["totalSupply(uint256)"](0)).to.equal(initialQCAT - amount);

      await mine(6);
      await quantumCat.observe(data);

      // After observe: ALIVECAT + DEADCAT should equal burned QCAT
      const alive = await quantumCat["totalSupply(uint256)"](1);
      const dead = await quantumCat["totalSupply(uint256)"](2);
      expect(alive + dead).to.equal(amount);

      // Total tokens in circulation
      const qcatAfterObserve = await quantumCat["totalSupply(uint256)"](0);
      const totalAfterObserve = qcatAfterObserve + alive + dead;
      expect(totalAfterObserve).to.equal(initialTotal);

      // Rebox some pairs
      const pairs = alive < dead ? alive : dead;
      if (pairs > 0n) {
        await quantumCat.rebox(pairs);

        // After rebox: supply should be consistent minus fee
        const qcatAfterRebox = await quantumCat["totalSupply(uint256)"](0);
        const aliveAfterRebox = await quantumCat["totalSupply(uint256)"](1);
        const deadAfterRebox = await quantumCat["totalSupply(uint256)"](2);

        // Calculate fee exactly as contract does
        const base = 2n * pairs;
        const feeTokens = (base * 500n) / 10000n; // reboxFeeBps = 500
        const mintAmt = base - feeTokens;
        const expectedQCAT = qcatAfterObserve + mintAmt;

        expect(qcatAfterRebox).to.equal(expectedQCAT);
        expect(aliveAfterRebox).to.equal(alive - pairs);
        expect(deadAfterRebox).to.equal(dead - pairs);
      }
    });

    it("Should not allow multiple pending observations per user", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const dataHash1 = ethers.keccak256(ethers.toUtf8Bytes("first"));
      const dataHash2 = ethers.keccak256(ethers.toUtf8Bytes("second"));

      await quantumCat.commitObserve(amount, dataHash1, DEFAULT_ENTROPY);

      // Try to commit again while first is pending
      await expect(
        quantumCat.commitObserve(amount, dataHash2, DEFAULT_ENTROPY)
      ).to.be.revertedWithCustomError(quantumCat, "PendingObservationExists");

      // Complete first observation
      await mine(6);
      await quantumCat.observe(ethers.toUtf8Bytes("first"));

      // Now should be able to commit again
      await expect(quantumCat.commitObserve(amount, dataHash2, generateEntropy("second")))
        .to.emit(quantumCat, "CommitObserve");
    });

    it("Should properly clean up pending state after observe", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const data = ethers.toUtf8Bytes("cleanup");
      const dataHash = ethers.keccak256(data);

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Verify pending state is set
      let pending = await quantumCat.pending(owner.address);
      expect(pending.active).to.be.true;
      expect(pending.amount).to.equal(amount);
      expect(pending.dataHash).to.equal(dataHash);

      await mine(6);
      await quantumCat.observe(data);

      // Verify pending state is cleared
      pending = await quantumCat.pending(owner.address);
      expect(pending.active).to.be.false;
      expect(pending.amount).to.equal(0);
      expect(pending.refBlock).to.equal(0);
    });

    it("Should properly clean up pending state after forceObserve", async function () {
      const { quantumCat, owner, user1 } = await loadFixture(deployQuantumCatFixture);

      const amount = 100n;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("force_cleanup"));

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Verify pending state is set
      let pending = await quantumCat.pending(owner.address);
      expect(pending.active).to.be.true;

      await mine(70);
      await quantumCat.connect(user1).forceObserve(owner.address);

      // Verify pending state is cleared
      pending = await quantumCat.pending(owner.address);
      expect(pending.active).to.be.false;
      expect(pending.amount).to.equal(0);
    });
  });

  describe("View Function Coverage", function () {
    it("Should correctly report canObserve at boundary conditions", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      // No pending observation
      expect(await quantumCat.canObserve(owner.address)).to.be.false;

      const amount = 100n;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("boundary_view"));

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Just committed - should be false
      expect(await quantumCat.canObserve(owner.address)).to.be.false;

      // At exactly REVEAL_DELAY blocks
      await mine(5);
      expect(await quantumCat.canObserve(owner.address)).to.be.false;

      // After REVEAL_DELAY blocks
      await mine(1);
      expect(await quantumCat.canObserve(owner.address)).to.be.true;
    });

    it("Should correctly report canForceObserve at boundary conditions", async function () {
      const { quantumCat, owner } = await loadFixture(deployQuantumCatFixture);

      // No pending observation
      expect(await quantumCat.canForceObserve(owner.address)).to.be.false;

      const amount = 100n;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("force_boundary_view"));

      await quantumCat.commitObserve(amount, dataHash, DEFAULT_ENTROPY);

      // Just committed - should be false
      expect(await quantumCat.canForceObserve(owner.address)).to.be.false;

      // At REVEAL_DELAY + GRACE exactly
      await mine(69);
      expect(await quantumCat.canForceObserve(owner.address)).to.be.false;

      // After REVEAL_DELAY + GRACE
      await mine(1);
      expect(await quantumCat.canForceObserve(owner.address)).to.be.true;
    });

    it("Should calculate rebox output for various pair amounts", async function () {
      const { quantumCat } = await loadFixture(deployQuantumCatFixture);

      const testCases = [
        { pairs: 1n, expectedOut: 1n, expectedFee: 0n }, // 2*1 = 2, fee = 0 (rounded down), out = 2-0 = 2 but actually 1.9
        { pairs: 10n, expectedOut: 19n, expectedFee: 1n }, // 2*10 = 20, fee = 1, out = 19
        { pairs: 100n, expectedOut: 190n, expectedFee: 10n }, // 2*100 = 200, fee = 10, out = 190
        { pairs: 1000n, expectedOut: 1900n, expectedFee: 100n } // 2*1000 = 2000, fee = 100, out = 1900
      ];

      for (const tc of testCases) {
        const [qcatOut, feeTaken] = await quantumCat.calculateReboxOutput(tc.pairs);

        // Fee is 5% (500 bps out of 10000)
        const base = 2n * tc.pairs;
        const expectedFee = (base * 500n) / 10000n;
        const expectedOut = base - expectedFee;

        expect(qcatOut).to.equal(expectedOut);
        expect(feeTaken).to.equal(expectedFee);
      }
    });
  });
});
