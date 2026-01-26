import api from "./api";

export const web3Service = {
    mintLease: async (leaseId: string, ownerWallet?: string) => {
        const response = await api.post(`/web3/mint/${leaseId}`, { ownerWallet });
        return response.data;
    },

    getStatus: async (leaseId: string) => {
        const response = await api.get(`/web3/status/${leaseId}`);
        return response.data;
    },

    getExplorerUrl: async (hash: string) => {
        const response = await api.get(`/web3/explorer/${hash}`);
        return response.data;
    }
};
