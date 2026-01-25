import { useState } from "react";
import {
  Wallet,
  Link2,
  Link2Off,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  FileSignature,
  Globe,
} from "lucide-react";
import { useWalletStore, shortenAddress, formatBalance } from "../../../stores/useWalletStore";
import { toast } from "sonner";

// ============================================================
// WEB3 DEBUG PAGE - Página de Diagnóstico Web3
// ============================================================

export function Web3DebugPage() {
  const {
    address,
    balance,
    network,
    isConnecting,
    isConnected,
    error,
    connectWallet,
    disconnect,
    refreshBalance,
    signMessage,
    switchNetwork,
  } = useWalletStore();

  const [signatureResult, setSignatureResult] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const handleConnect = async () => {
    await connectWallet();
    if (useWalletStore.getState().isConnected) {
      toast.success("Carteira conectada com sucesso!");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSignatureResult(null);
    toast.info("Carteira desconectada");
  };

  const handleRefreshBalance = async () => {
    await refreshBalance();
    toast.success("Saldo atualizado!");
  };

  const handleSignMessage = async () => {
    setIsSigning(true);
    const testMessage = `Vínculo Brasil - Teste de Assinatura\n\nData: ${new Date().toISOString()}\nEndereço: ${address}`;
    const signature = await signMessage(testMessage);
    setIsSigning(false);

    if (signature) {
      setSignatureResult(signature);
      toast.success("Mensagem assinada com sucesso!");
    } else {
      toast.error("Falha ao assinar mensagem");
    }
  };

  const handleSwitchToPolygon = async () => {
    const success = await switchNetwork("0x89");
    if (success) {
      toast.success("Rede alterada para Polygon Mainnet!");
    }
  };

  const handleSwitchToAmoy = async () => {
    const success = await switchNetwork("0x13882");
    if (success) {
      toast.success("Rede alterada para Polygon Amoy Testnet!");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Wallet className="text-purple-600" size={28} />
          Web3 Debug Console
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Diagnóstico e testes de conexão blockchain
        </p>
      </div>

      {/* Aviso se MetaMask não instalada */}
      {typeof window !== "undefined" && !window.ethereum && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
              MetaMask Não Detectada
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Para usar recursos Web3, instale a extensão MetaMask no seu navegador.
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-yellow-700 dark:text-yellow-400 hover:underline mt-2"
            >
              Baixar MetaMask <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Erro</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Connection Status Card */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Status da Conexão
          </h2>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isConnected
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            {isConnected ? (
              <>
                <CheckCircle size={16} />
                Conectado
              </>
            ) : (
              <>
                <Link2Off size={16} />
                Desconectado
              </>
            )}
          </div>
        </div>

        {/* Connection Actions */}
        <div className="flex gap-3 mb-6">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Conectando...
                </>
              ) : (
                <>
                  <Link2 size={18} />
                  Conectar MetaMask
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleRefreshBalance}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={18} />
                Atualizar Saldo
              </button>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <Link2Off size={18} />
                Desconectar
              </button>
            </>
          )}
        </div>

        {/* Connection Details */}
        {isConnected && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Address */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Endereço</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {address}
                </code>
                <button
                  onClick={() => address && copyToClipboard(address)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <Copy size={14} className="text-gray-500" />
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Encurtado: {shortenAddress(address)}
              </p>
            </div>

            {/* Balance */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saldo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatBalance(balance)} <span className="text-sm text-gray-500">MATIC</span>
              </p>
            </div>

            {/* Network */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 md:col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rede</p>
              <div className="flex items-center gap-3">
                <Globe className={network?.isSupported ? "text-green-600" : "text-yellow-600"} size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {network?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Chain ID: {network?.chainId}
                  </p>
                </div>
                {!network?.isSupported && (
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full">
                    Rede não recomendada
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Network Switcher */}
      {isConnected && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Trocar Rede
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSwitchToPolygon}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                network?.chainId === "0x89"
                  ? "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              Polygon Mainnet
              {network?.chainId === "0x89" && <CheckCircle size={16} className="text-purple-600" />}
            </button>

            <button
              onClick={handleSwitchToAmoy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                network?.chainId === "0x13882"
                  ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              Polygon Amoy (Testnet)
              {network?.chainId === "0x13882" && <CheckCircle size={16} className="text-blue-600" />}
            </button>
          </div>
        </div>
      )}

      {/* Signature Test */}
      {isConnected && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Teste de Assinatura
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Assine uma mensagem de teste para verificar se a chave privada está funcionando corretamente.
          </p>

          <button
            onClick={handleSignMessage}
            disabled={isSigning}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSigning ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                Aguardando assinatura...
              </>
            ) : (
              <>
                <FileSignature size={18} />
                Assinar Mensagem de Teste
              </>
            )}
          </button>

          {signatureResult && (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-green-800 dark:text-green-300 mb-2">
                    Assinatura bem-sucedida!
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-green-700 dark:text-green-400 break-all">
                      {signatureResult.slice(0, 42)}...
                    </code>
                    <button
                      onClick={() => copyToClipboard(signatureResult)}
                      className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded"
                    >
                      <Copy size={14} className="text-green-600 dark:text-green-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
          Informações do Sistema Web3
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>- Biblioteca: Ethers.js v6</li>
          <li>- Redes Suportadas: Polygon Mainnet, Polygon Amoy Testnet</li>
          <li>- Carteiras: MetaMask, WalletConnect (futuro)</li>
          <li>- Smart Contracts: VinculoProtocol, VBRzToken (deploy futuro)</li>
        </ul>
      </div>
    </div>
  );
}
