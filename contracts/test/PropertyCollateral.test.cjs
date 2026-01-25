/**
 * Tests for PropertyCollateral
 *
 * Run: npx hardhat test test/PropertyCollateral.test.cjs
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyCollateral", function () {
  let propertyCollateral;
  let vinculoContract;
  let owner, guarantor1, guarantor2, landlord, tenant, insurer;

  const PROPERTY_VALUE_BRL = 50000000n; // R$ 500.000,00 em centavos
  const PROPERTY_VALUE_WEI = ethers.parseEther("100"); // 100 MATIC equivalente

  beforeEach(async function () {
    [owner, guarantor1, guarantor2, landlord, tenant, insurer] = await ethers.getSigners();

    // Deploy PropertyCollateral
    const PropertyCollateral = await ethers.getContractFactory("PropertyCollateral");
    propertyCollateral = await PropertyCollateral.deploy();
    await propertyCollateral.waitForDeployment();

    // Deploy VinculoContract for integration tests
    const VinculoContract = await ethers.getContractFactory("VinculoContract");
    vinculoContract = await VinculoContract.deploy(owner.address);
    await vinculoContract.waitForDeployment();

    // Link contracts
    const vinculoAddress = await vinculoContract.getAddress();
    await propertyCollateral.setVinculoContract(vinculoAddress);
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await propertyCollateral.name()).to.equal("Vinculo Property Collateral");
      expect(await propertyCollateral.symbol()).to.equal("VPROP");
    });

    it("Should set owner correctly", async function () {
      expect(await propertyCollateral.owner()).to.equal(owner.address);
    });

    it("Should start with zero properties", async function () {
      const stats = await propertyCollateral.getStats();
      expect(stats._totalProperties).to.equal(0);
      expect(stats._totalLockedValue).to.equal(0);
    });
  });

  describe("Property Registration", function () {
    it("Should register a new property", async function () {
      const tx = await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001",
        "123.456.789",
        PROPERTY_VALUE_BRL,
        PROPERTY_VALUE_WEI,
        "Sao Paulo",
        "SP",
        "QmPropertyHash123"
      );

      await expect(tx)
        .to.emit(propertyCollateral, "PropertyRegistered")
        .withArgs(1, guarantor1.address, "PROP-001", PROPERTY_VALUE_BRL);

      // Verify property data
      const property = await propertyCollateral.getProperty(1);
      expect(property.propertyId).to.equal("PROP-001");
      expect(property.registrationNumber).to.equal("123.456.789");
      expect(property.owner).to.equal(guarantor1.address);
      expect(property.valueBRL).to.equal(PROPERTY_VALUE_BRL);
      expect(property.city).to.equal("Sao Paulo");
      expect(property.state).to.equal("SP");
      expect(property.isLocked).to.be.false;
      expect(property.isVerified).to.be.false;
    });

    it("Should mint NFT to owner", async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001",
        "123.456.789",
        PROPERTY_VALUE_BRL,
        PROPERTY_VALUE_WEI,
        "Sao Paulo",
        "SP",
        "QmPropertyHash123"
      );

      expect(await propertyCollateral.ownerOf(1)).to.equal(guarantor1.address);
      expect(await propertyCollateral.balanceOf(guarantor1.address)).to.equal(1);
    });

    it("Should reject duplicate property registration", async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001",
        "123.456.789",
        PROPERTY_VALUE_BRL,
        PROPERTY_VALUE_WEI,
        "Sao Paulo",
        "SP",
        "QmPropertyHash123"
      );

      await expect(
        propertyCollateral.connect(guarantor2).registerProperty(
          "PROP-001", // Same property ID
          "987.654.321",
          PROPERTY_VALUE_BRL,
          PROPERTY_VALUE_WEI,
          "Rio de Janeiro",
          "RJ",
          "QmAnotherHash"
        )
      ).to.be.revertedWith("PropertyCollateral: property already registered");
    });

    it("Should reject invalid property values", async function () {
      await expect(
        propertyCollateral.connect(guarantor1).registerProperty(
          "",
          "123.456.789",
          PROPERTY_VALUE_BRL,
          PROPERTY_VALUE_WEI,
          "Sao Paulo",
          "SP",
          "QmHash"
        )
      ).to.be.revertedWith("PropertyCollateral: invalid propertyId");

      await expect(
        propertyCollateral.connect(guarantor1).registerProperty(
          "PROP-001",
          "",
          PROPERTY_VALUE_BRL,
          PROPERTY_VALUE_WEI,
          "Sao Paulo",
          "SP",
          "QmHash"
        )
      ).to.be.revertedWith("PropertyCollateral: invalid registration");

      await expect(
        propertyCollateral.connect(guarantor1).registerProperty(
          "PROP-001",
          "123.456.789",
          0, // Zero value
          PROPERTY_VALUE_WEI,
          "Sao Paulo",
          "SP",
          "QmHash"
        )
      ).to.be.revertedWith("PropertyCollateral: value must be positive");
    });

    it("Should track owner properties", async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001", "123.456.789", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "SP", "SP", "QmHash1"
      );
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-002", "987.654.321", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "RJ", "RJ", "QmHash2"
      );

      const ownerProps = await propertyCollateral.getOwnerProperties(guarantor1.address);
      expect(ownerProps.length).to.equal(2);
      expect(ownerProps[0]).to.equal(1n);
      expect(ownerProps[1]).to.equal(2n);
    });
  });

  describe("Property Verification", function () {
    beforeEach(async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001", "123.456.789", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "SP", "SP", "QmHash"
      );
    });

    it("Should allow owner to verify property", async function () {
      const tx = await propertyCollateral.connect(owner).verifyProperty(1);

      await expect(tx)
        .to.emit(propertyCollateral, "PropertyVerified")
        .withArgs(1, owner.address);

      const property = await propertyCollateral.getProperty(1);
      expect(property.isVerified).to.be.true;
    });

    it("Should reject verification from non-owner", async function () {
      await expect(
        propertyCollateral.connect(guarantor1).verifyProperty(1)
      ).to.be.revertedWithCustomError(propertyCollateral, "OwnableUnauthorizedAccount");
    });

    it("Should reject double verification", async function () {
      await propertyCollateral.connect(owner).verifyProperty(1);

      await expect(
        propertyCollateral.connect(owner).verifyProperty(1)
      ).to.be.revertedWith("PropertyCollateral: already verified");
    });
  });

  describe("Collateral Locking", function () {
    const RENTAL_CONTRACT_ID = 42;

    beforeEach(async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001", "123.456.789", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "SP", "SP", "QmHash"
      );
      await propertyCollateral.connect(owner).verifyProperty(1);
    });

    it("Should allow owner to lock as collateral", async function () {
      const tx = await propertyCollateral.connect(guarantor1).lockAsCollateral(1, RENTAL_CONTRACT_ID);

      await expect(tx)
        .to.emit(propertyCollateral, "PropertyLocked")
        .withArgs(1, RENTAL_CONTRACT_ID, guarantor1.address);

      const property = await propertyCollateral.getProperty(1);
      expect(property.isLocked).to.be.true;
      expect(property.lockedForRental).to.equal(RENTAL_CONTRACT_ID);
    });

    it("Should update stats when locked", async function () {
      await propertyCollateral.connect(guarantor1).lockAsCollateral(1, RENTAL_CONTRACT_ID);

      const stats = await propertyCollateral.getStats();
      expect(stats._totalLockedValue).to.equal(PROPERTY_VALUE_BRL);
    });

    it("Should reject locking unverified property", async function () {
      // Register another unverified property
      await propertyCollateral.connect(guarantor2).registerProperty(
        "PROP-002", "987.654.321", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "RJ", "RJ", "QmHash2"
      );

      await expect(
        propertyCollateral.connect(guarantor2).lockAsCollateral(2, RENTAL_CONTRACT_ID)
      ).to.be.revertedWith("PropertyCollateral: property not verified");
    });

    it("Should reject locking by non-owner", async function () {
      await expect(
        propertyCollateral.connect(guarantor2).lockAsCollateral(1, RENTAL_CONTRACT_ID)
      ).to.be.revertedWith("PropertyCollateral: not owner");
    });

    it("Should reject double locking", async function () {
      await propertyCollateral.connect(guarantor1).lockAsCollateral(1, RENTAL_CONTRACT_ID);

      await expect(
        propertyCollateral.connect(guarantor1).lockAsCollateral(1, 99)
      ).to.be.revertedWith("PropertyCollateral: property is locked");
    });

    it("Should record lock history", async function () {
      await propertyCollateral.connect(guarantor1).lockAsCollateral(1, RENTAL_CONTRACT_ID);

      const history = await propertyCollateral.getLockHistory(1);
      expect(history.length).to.equal(1);
      expect(history[0].rentalContractId).to.equal(RENTAL_CONTRACT_ID);
      expect(history[0].lockedBy).to.equal(guarantor1.address);
      expect(history[0].isActive).to.be.true;
    });
  });

  describe("Collateral Unlocking", function () {
    const RENTAL_CONTRACT_ID = 42;

    beforeEach(async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001", "123.456.789", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "SP", "SP", "QmHash"
      );
      await propertyCollateral.connect(owner).verifyProperty(1);
      await propertyCollateral.connect(guarantor1).lockAsCollateral(1, RENTAL_CONTRACT_ID);
    });

    it("Should allow property owner to unlock", async function () {
      const tx = await propertyCollateral.connect(guarantor1).unlockCollateral(1, RENTAL_CONTRACT_ID);

      await expect(tx)
        .to.emit(propertyCollateral, "PropertyUnlocked")
        .withArgs(1, RENTAL_CONTRACT_ID);

      const property = await propertyCollateral.getProperty(1);
      expect(property.isLocked).to.be.false;
      expect(property.lockedForRental).to.equal(0);
    });

    it("Should allow admin to unlock", async function () {
      await propertyCollateral.connect(owner).unlockCollateral(1, RENTAL_CONTRACT_ID);

      const property = await propertyCollateral.getProperty(1);
      expect(property.isLocked).to.be.false;
    });

    it("Should update stats when unlocked", async function () {
      await propertyCollateral.connect(guarantor1).unlockCollateral(1, RENTAL_CONTRACT_ID);

      const stats = await propertyCollateral.getStats();
      expect(stats._totalLockedValue).to.equal(0);
    });

    it("Should reject unlock with wrong rental ID", async function () {
      await expect(
        propertyCollateral.connect(guarantor1).unlockCollateral(1, 99) // Wrong ID
      ).to.be.revertedWith("PropertyCollateral: wrong rental contract");
    });

    it("Should reject unlock from unauthorized address", async function () {
      await expect(
        propertyCollateral.connect(guarantor2).unlockCollateral(1, RENTAL_CONTRACT_ID)
      ).to.be.revertedWith("PropertyCollateral: not authorized");
    });

    it("Should update lock history on unlock", async function () {
      await propertyCollateral.connect(guarantor1).unlockCollateral(1, RENTAL_CONTRACT_ID);

      const history = await propertyCollateral.getLockHistory(1);
      expect(history[0].isActive).to.be.false;
      expect(history[0].unlockedAt).to.be.greaterThan(0);
    });
  });

  describe("Property Liquidation", function () {
    const RENTAL_CONTRACT_ID = 42;

    beforeEach(async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001", "123.456.789", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "SP", "SP", "QmHash"
      );
      await propertyCollateral.connect(owner).verifyProperty(1);
      await propertyCollateral.connect(guarantor1).lockAsCollateral(1, RENTAL_CONTRACT_ID);
    });

    it("Should allow admin to liquidate property", async function () {
      const liquidationAmount = ethers.parseEther("10");

      const tx = await propertyCollateral.connect(owner).liquidateProperty(
        1,
        landlord.address,
        liquidationAmount
      );

      await expect(tx)
        .to.emit(propertyCollateral, "PropertyLiquidated")
        .withArgs(1, guarantor1.address, landlord.address, liquidationAmount);

      // NFT should be transferred to landlord
      expect(await propertyCollateral.ownerOf(1)).to.equal(landlord.address);

      const property = await propertyCollateral.getProperty(1);
      expect(property.owner).to.equal(landlord.address);
      expect(property.isLocked).to.be.false;
    });

    it("Should update owner properties after liquidation", async function () {
      await propertyCollateral.connect(owner).liquidateProperty(1, landlord.address, 0);

      const oldOwnerProps = await propertyCollateral.getOwnerProperties(guarantor1.address);
      const newOwnerProps = await propertyCollateral.getOwnerProperties(landlord.address);

      expect(oldOwnerProps.length).to.equal(0);
      expect(newOwnerProps.length).to.equal(1);
    });

    it("Should reject liquidation of unlocked property", async function () {
      await propertyCollateral.connect(guarantor1).unlockCollateral(1, RENTAL_CONTRACT_ID);

      await expect(
        propertyCollateral.connect(owner).liquidateProperty(1, landlord.address, 0)
      ).to.be.revertedWith("PropertyCollateral: property not locked");
    });

    it("Should reject liquidation from non-admin", async function () {
      await expect(
        propertyCollateral.connect(guarantor1).liquidateProperty(1, landlord.address, 0)
      ).to.be.revertedWith("PropertyCollateral: not authorized to liquidate");
    });
  });

  describe("Property Value Updates", function () {
    beforeEach(async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001", "123.456.789", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "SP", "SP", "QmHash"
      );
    });

    it("Should allow admin to update value", async function () {
      const newValueBRL = 60000000n; // R$ 600.000,00
      const newValueWei = ethers.parseEther("120");

      const tx = await propertyCollateral.connect(owner).updatePropertyValue(1, newValueBRL, newValueWei);

      await expect(tx)
        .to.emit(propertyCollateral, "PropertyValueUpdated")
        .withArgs(1, PROPERTY_VALUE_BRL, newValueBRL);

      const property = await propertyCollateral.getProperty(1);
      expect(property.valueBRL).to.equal(newValueBRL);
      expect(property.valueWei).to.equal(newValueWei);
    });

    it("Should update locked value stats when property value changes", async function () {
      await propertyCollateral.connect(owner).verifyProperty(1);
      await propertyCollateral.connect(guarantor1).lockAsCollateral(1, 42);

      const newValueBRL = 60000000n;
      await propertyCollateral.connect(owner).updatePropertyValue(1, newValueBRL, ethers.parseEther("120"));

      const stats = await propertyCollateral.getStats();
      expect(stats._totalLockedValue).to.equal(newValueBRL);
    });
  });

  describe("Transfer Restrictions", function () {
    beforeEach(async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001", "123.456.789", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "SP", "SP", "QmHash"
      );
      await propertyCollateral.connect(owner).verifyProperty(1);
    });

    it("Should allow transfer of unlocked property", async function () {
      await propertyCollateral.connect(guarantor1).transferFrom(
        guarantor1.address,
        guarantor2.address,
        1
      );

      expect(await propertyCollateral.ownerOf(1)).to.equal(guarantor2.address);
    });

    it("Should prevent transfer of locked property", async function () {
      await propertyCollateral.connect(guarantor1).lockAsCollateral(1, 42);

      await expect(
        propertyCollateral.connect(guarantor1).transferFrom(
          guarantor1.address,
          guarantor2.address,
          1
        )
      ).to.be.revertedWith("PropertyCollateral: cannot transfer locked property");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await propertyCollateral.connect(guarantor1).registerProperty(
        "PROP-001", "123.456.789", PROPERTY_VALUE_BRL, PROPERTY_VALUE_WEI, "SP", "SP", "QmHash"
      );
      await propertyCollateral.connect(owner).verifyProperty(1);
    });

    it("Should check if property can be used as collateral", async function () {
      expect(await propertyCollateral.canBeUsedAsCollateral(1)).to.be.true;

      await propertyCollateral.connect(guarantor1).lockAsCollateral(1, 42);
      expect(await propertyCollateral.canBeUsedAsCollateral(1)).to.be.false;
    });

    it("Should return property by propertyId", async function () {
      const tokenId = await propertyCollateral.propertyIdToToken("PROP-001");
      expect(tokenId).to.equal(1);
    });

    it("Should return correct stats", async function () {
      const stats = await propertyCollateral.getStats();
      expect(stats._totalProperties).to.equal(1);
      expect(stats._totalLockedValue).to.equal(0);
      expect(stats._tokenCounter).to.equal(1);
    });
  });
});
