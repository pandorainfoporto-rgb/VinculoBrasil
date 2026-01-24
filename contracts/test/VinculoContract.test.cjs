/**
 * Tests for VinculoContract
 *
 * Run: npx hardhat test
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VinculoContract", function () {
  let vinculoContract;
  let owner, landlord, tenant, guarantor, insurer, platformWallet;

  const RENT_AMOUNT = ethers.parseEther("0.1"); // 0.1 MATIC
  const SECURITY_DEPOSIT = ethers.parseEther("0.3"); // 0.3 MATIC

  beforeEach(async function () {
    [owner, landlord, tenant, guarantor, insurer, platformWallet] = await ethers.getSigners();

    const VinculoContract = await ethers.getContractFactory("VinculoContract");
    vinculoContract = await VinculoContract.deploy(platformWallet.address);
    await vinculoContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct platform wallet", async function () {
      expect(await vinculoContract.platformWallet()).to.equal(platformWallet.address);
    });

    it("Should have correct split percentages", async function () {
      expect(await vinculoContract.LANDLORD_SPLIT()).to.equal(85);
      expect(await vinculoContract.INSURER_SPLIT()).to.equal(5);
      expect(await vinculoContract.PLATFORM_SPLIT()).to.equal(5);
      expect(await vinculoContract.GUARANTOR_SPLIT()).to.equal(5);
    });

    it("Should have correct name and symbol", async function () {
      expect(await vinculoContract.name()).to.equal("Vinculo Rental Contract");
      expect(await vinculoContract.symbol()).to.equal("VINCULO");
    });
  });

  describe("Rental Creation", function () {
    it("Should create a new rental", async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60; // 1 year

      const tx = await vinculoContract.createRental(
        landlord.address,
        tenant.address,
        guarantor.address,
        insurer.address,
        RENT_AMOUNT,
        SECURITY_DEPOSIT,
        startDate,
        endDate,
        10, // due day
        "PROP-001",
        "QmTestHash123"
      );

      await expect(tx)
        .to.emit(vinculoContract, "RentalCreated")
        .withArgs(0, landlord.address, tenant.address, RENT_AMOUNT, "PROP-001");

      // Verify rental data
      const rental = await vinculoContract.getRental(0);
      expect(rental.landlord).to.equal(landlord.address);
      expect(rental.tenant).to.equal(tenant.address);
      expect(rental.guarantor).to.equal(guarantor.address);
      expect(rental.insurer).to.equal(insurer.address);
      expect(rental.rentAmount).to.equal(RENT_AMOUNT);
      expect(rental.status).to.equal(0); // Pending
    });

    it("Should mint NFT to landlord", async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await vinculoContract.createRental(
        landlord.address,
        tenant.address,
        guarantor.address,
        insurer.address,
        RENT_AMOUNT,
        SECURITY_DEPOSIT,
        startDate,
        endDate,
        10,
        "PROP-001",
        "QmTestHash123"
      );

      expect(await vinculoContract.ownerOf(0)).to.equal(landlord.address);
      expect(await vinculoContract.balanceOf(landlord.address)).to.equal(1);
    });

    it("Should reject invalid participants", async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      // Same landlord and tenant
      await expect(
        vinculoContract.createRental(
          landlord.address,
          landlord.address, // Same as landlord
          guarantor.address,
          insurer.address,
          RENT_AMOUNT,
          SECURITY_DEPOSIT,
          startDate,
          endDate,
          10,
          "PROP-001",
          "QmTestHash123"
        )
      ).to.be.revertedWith("Vinculo: participants must be different");
    });

    it("Should reject invalid due day", async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await expect(
        vinculoContract.createRental(
          landlord.address,
          tenant.address,
          guarantor.address,
          insurer.address,
          RENT_AMOUNT,
          SECURITY_DEPOSIT,
          startDate,
          endDate,
          31, // Invalid - must be 1-28
          "PROP-001",
          "QmTestHash123"
        )
      ).to.be.revertedWith("Vinculo: invalid due day");
    });
  });

  describe("Collateral and Activation", function () {
    let tokenId;

    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await vinculoContract.createRental(
        landlord.address,
        tenant.address,
        guarantor.address,
        insurer.address,
        RENT_AMOUNT,
        SECURITY_DEPOSIT,
        startDate,
        endDate,
        10,
        "PROP-001",
        "QmTestHash123"
      );
      tokenId = 0;
    });

    it("Should allow guarantor to lock collateral", async function () {
      const collateralValue = ethers.parseEther("1");

      const tx = await vinculoContract
        .connect(guarantor)
        .lockCollateral(tokenId, "COLLATERAL-PROP-001", collateralValue);

      await expect(tx)
        .to.emit(vinculoContract, "CollateralLocked")
        .withArgs(tokenId, guarantor.address, "COLLATERAL-PROP-001", collateralValue);

      expect(await vinculoContract.collateralLocked(tokenId)).to.be.true;
    });

    it("Should reject collateral from non-guarantor", async function () {
      await expect(
        vinculoContract
          .connect(tenant)
          .lockCollateral(tokenId, "COLLATERAL-PROP-001", ethers.parseEther("1"))
      ).to.be.revertedWith("Vinculo: only guarantor can lock collateral");
    });

    it("Should activate rental after collateral", async function () {
      // Lock collateral first
      await vinculoContract
        .connect(guarantor)
        .lockCollateral(tokenId, "COLLATERAL-PROP-001", ethers.parseEther("1"));

      // Activate
      const tx = await vinculoContract.connect(landlord).activateRental(tokenId);

      await expect(tx).to.emit(vinculoContract, "RentalActivated");

      const rental = await vinculoContract.getRental(tokenId);
      expect(rental.status).to.equal(1); // Active
    });

    it("Should reject activation without collateral", async function () {
      await expect(
        vinculoContract.connect(landlord).activateRental(tokenId)
      ).to.be.revertedWith("Vinculo: collateral must be locked first");
    });
  });

  describe("Payment with Split 85/5/5/5", function () {
    let tokenId;

    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await vinculoContract.createRental(
        landlord.address,
        tenant.address,
        guarantor.address,
        insurer.address,
        RENT_AMOUNT,
        SECURITY_DEPOSIT,
        startDate,
        endDate,
        10,
        "PROP-001",
        "QmTestHash123"
      );
      tokenId = 0;

      // Setup: lock collateral and activate
      await vinculoContract
        .connect(guarantor)
        .lockCollateral(tokenId, "COLLATERAL-PROP-001", ethers.parseEther("1"));
      await vinculoContract.connect(landlord).activateRental(tokenId);
    });

    it("Should split payment correctly 85/5/5/5", async function () {
      const paymentAmount = ethers.parseEther("1"); // 1 MATIC

      // Get initial balances
      const landlordBefore = await ethers.provider.getBalance(landlord.address);
      const insurerBefore = await ethers.provider.getBalance(insurer.address);
      const platformBefore = await ethers.provider.getBalance(platformWallet.address);
      const guarantorBefore = await ethers.provider.getBalance(guarantor.address);

      // Pay rent
      const tx = await vinculoContract
        .connect(tenant)
        .payRent(tokenId, { value: paymentAmount });

      await expect(tx).to.emit(vinculoContract, "PaymentReceived");

      // Get final balances
      const landlordAfter = await ethers.provider.getBalance(landlord.address);
      const insurerAfter = await ethers.provider.getBalance(insurer.address);
      const platformAfter = await ethers.provider.getBalance(platformWallet.address);
      const guarantorAfter = await ethers.provider.getBalance(guarantor.address);

      // Calculate expected amounts
      const expectedLandlord = (paymentAmount * 85n) / 100n;
      const expectedOthers = (paymentAmount * 5n) / 100n;

      // Verify splits (with small tolerance for rounding)
      expect(landlordAfter - landlordBefore).to.be.closeTo(expectedLandlord, 1000);
      expect(insurerAfter - insurerBefore).to.equal(expectedOthers);
      expect(platformAfter - platformBefore).to.equal(expectedOthers);
      expect(guarantorAfter - guarantorBefore).to.equal(expectedOthers);
    });

    it("Should record payment in history", async function () {
      await vinculoContract
        .connect(tenant)
        .payRent(tokenId, { value: RENT_AMOUNT });

      const history = await vinculoContract.getPaymentHistory(tokenId);
      expect(history.length).to.equal(1);
      expect(history[0].amount).to.equal(RENT_AMOUNT);
      expect(history[0].status).to.equal(1); // Paid
    });

    it("Should update stats after payment", async function () {
      await vinculoContract
        .connect(tenant)
        .payRent(tokenId, { value: RENT_AMOUNT });

      const stats = await vinculoContract.getStats();
      expect(stats._totalVolume).to.equal(RENT_AMOUNT);
      expect(stats._totalPaymentsProcessed).to.equal(1);
    });

    it("Should reject insufficient payment", async function () {
      const insufficientAmount = RENT_AMOUNT / 2n;

      await expect(
        vinculoContract
          .connect(tenant)
          .payRent(tokenId, { value: insufficientAmount })
      ).to.be.revertedWith("Vinculo: insufficient payment");
    });

    it("Should reject payment from unauthorized address", async function () {
      await expect(
        vinculoContract
          .connect(owner)
          .payRent(tokenId, { value: RENT_AMOUNT })
      ).to.be.revertedWith("Vinculo: only tenant or guarantor can pay");
    });
  });

  describe("Disputes", function () {
    let tokenId;

    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await vinculoContract.createRental(
        landlord.address,
        tenant.address,
        guarantor.address,
        insurer.address,
        RENT_AMOUNT,
        SECURITY_DEPOSIT,
        startDate,
        endDate,
        10,
        "PROP-001",
        "QmTestHash123"
      );
      tokenId = 0;

      await vinculoContract
        .connect(guarantor)
        .lockCollateral(tokenId, "COLLATERAL-PROP-001", ethers.parseEther("1"));
      await vinculoContract.connect(landlord).activateRental(tokenId);
    });

    it("Should allow participant to open dispute", async function () {
      const tx = await vinculoContract
        .connect(landlord)
        .openDispute(tokenId, "Tenant not paying rent");

      await expect(tx)
        .to.emit(vinculoContract, "DisputeOpened")
        .withArgs(tokenId, landlord.address, "Tenant not paying rent");

      const rental = await vinculoContract.getRental(tokenId);
      expect(rental.status).to.equal(2); // Disputed
    });

    it("Should allow admin to resolve dispute in favor of landlord", async function () {
      await vinculoContract.connect(landlord).openDispute(tokenId, "Non-payment");

      const tx = await vinculoContract.connect(owner).resolveDispute(tokenId, true);

      await expect(tx)
        .to.emit(vinculoContract, "DisputeResolved")
        .withArgs(tokenId, true);

      const rental = await vinculoContract.getRental(tokenId);
      expect(rental.status).to.equal(4); // Defaulted
    });

    it("Should allow admin to resolve dispute in favor of tenant", async function () {
      await vinculoContract.connect(landlord).openDispute(tokenId, "False claim");

      await vinculoContract.connect(owner).resolveDispute(tokenId, false);

      const rental = await vinculoContract.getRental(tokenId);
      expect(rental.status).to.equal(1); // Active again
    });
  });

  describe("Termination", function () {
    let tokenId;

    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await vinculoContract.createRental(
        landlord.address,
        tenant.address,
        guarantor.address,
        insurer.address,
        RENT_AMOUNT,
        SECURITY_DEPOSIT,
        startDate,
        endDate,
        10,
        "PROP-001",
        "QmTestHash123"
      );
      tokenId = 0;

      await vinculoContract
        .connect(guarantor)
        .lockCollateral(tokenId, "COLLATERAL-PROP-001", ethers.parseEther("1"));
      await vinculoContract.connect(landlord).activateRental(tokenId);
    });

    it("Should allow landlord to terminate", async function () {
      const tx = await vinculoContract.connect(landlord).terminateRental(tokenId);

      await expect(tx)
        .to.emit(vinculoContract, "RentalTerminated")
        .withArgs(tokenId, 3); // Terminated status

      const rental = await vinculoContract.getRental(tokenId);
      expect(rental.status).to.equal(3);
    });

    it("Should unlock collateral on clean termination", async function () {
      await vinculoContract.connect(landlord).terminateRental(tokenId);

      expect(await vinculoContract.collateralLocked(tokenId)).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("Should calculate split correctly", async function () {
      const amount = ethers.parseEther("1");
      const split = await vinculoContract.calculateSplit(amount);

      expect(split.landlordAmount).to.equal((amount * 85n) / 100n);
      expect(split.insurerAmount).to.equal((amount * 5n) / 100n);
      expect(split.platformAmount).to.equal((amount * 5n) / 100n);
      expect(split.guarantorAmount).to.equal((amount * 5n) / 100n);
    });

    it("Should return rental lists by participant", async function () {
      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await vinculoContract.createRental(
        landlord.address,
        tenant.address,
        guarantor.address,
        insurer.address,
        RENT_AMOUNT,
        SECURITY_DEPOSIT,
        startDate,
        endDate,
        10,
        "PROP-001",
        "QmTestHash123"
      );

      const landlordRentals = await vinculoContract.getLandlordRentals(landlord.address);
      const tenantRentals = await vinculoContract.getTenantRentals(tenant.address);
      const guarantorRentals = await vinculoContract.getGuarantorRentals(guarantor.address);

      expect(landlordRentals.length).to.equal(1);
      expect(tenantRentals.length).to.equal(1);
      expect(guarantorRentals.length).to.equal(1);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform wallet", async function () {
      const newWallet = ethers.Wallet.createRandom().address;
      await vinculoContract.connect(owner).setPlatformWallet(newWallet);
      expect(await vinculoContract.platformWallet()).to.equal(newWallet);
    });

    it("Should allow owner to pause/unpause", async function () {
      await vinculoContract.connect(owner).pause();
      expect(await vinculoContract.paused()).to.be.true;

      await vinculoContract.connect(owner).unpause();
      expect(await vinculoContract.paused()).to.be.false;
    });

    it("Should reject operations when paused", async function () {
      await vinculoContract.connect(owner).pause();

      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await expect(
        vinculoContract.createRental(
          landlord.address,
          tenant.address,
          guarantor.address,
          insurer.address,
          RENT_AMOUNT,
          SECURITY_DEPOSIT,
          startDate,
          endDate,
          10,
          "PROP-001",
          "QmTestHash123"
        )
      ).to.be.revertedWithCustomError(vinculoContract, "EnforcedPause");
    });
  });
});
