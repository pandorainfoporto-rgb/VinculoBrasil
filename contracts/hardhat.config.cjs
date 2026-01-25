/** @type import('hardhat/config').HardhatUserConfig */

require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "e174778af54f4deb952c3f95a6f11c68";

// Use Infura as primary, Alchemy as fallback
const getPolygonRpcUrl = () => {
  if (INFURA_API_KEY) {
    return `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`;
  }
  if (ALCHEMY_API_KEY) {
    return `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  }
  return "https://polygon-rpc.com";
};

const getPolygonAmoyRpcUrl = () => {
  if (INFURA_API_KEY) {
    return `https://polygon-amoy.infura.io/v3/${INFURA_API_KEY}`;
  }
  if (ALCHEMY_API_KEY) {
    return `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  }
  return "https://rpc-amoy.polygon.technology";
};

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
    }
  },

  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },

    // Polygon Testnets (Amoy - new testnet replacing Mumbai)
    polygonAmoy: {
      url: getPolygonAmoyRpcUrl(),
      chainId: 80002,
      accounts: [PRIVATE_KEY],
      gasPrice: 35000000000 // 35 gwei
    },

    // Polygon Mainnet
    polygon: {
      url: getPolygonRpcUrl(),
      chainId: 137,
      accounts: [PRIVATE_KEY],
      gasPrice: 50000000000 // 50 gwei
    }
  },

  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY,
      polygonAmoy: POLYGONSCAN_API_KEY
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  },

  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    token: "MATIC",
    gasPriceApi: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice"
  },

  mocha: {
    timeout: 60000
  }
};
