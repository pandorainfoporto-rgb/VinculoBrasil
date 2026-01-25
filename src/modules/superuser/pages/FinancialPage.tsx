import { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileText,
  Download,
  Calendar,
  Building2,
  Users,
  Percent,
} from "lucide-react";
import { useContractStore } from "../../../stores/useContractStore";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================================
// FINANCIAL PAGE - DRE Dinâmico com Regras de Negócio
// ============================================================

export function FinancialPage() {
  const { contracts, getActiveContracts } = useContractStore();
  const { splitRates, setupFees, lastUpdated } = useBusinessRulesStore();
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month");

  // Contratos ativos
  const activeContracts = getActiveContracts();

  // Cálculos financeiros baseados nas regras de negócio
  const financialData = useMemo(() => {
    const multiplier = selectedPeriod === "month" ? 1 : selectedPeriod === "quarter" ? 3 : 12;

    // Faturamento bruto (soma dos aluguéis)
    const grossRevenue = activeContracts.reduce((sum, c) => sum + c.rentValue, 0) * multiplier;

    // Distribuição por split
    const platformRevenue = (grossRevenue * splitRates.platform) / 100;
    const insurerRevenue = (grossRevenue * splitRates.insurer) / 100;
    const guarantorRevenue = (grossRevenue * splitRates.guarantor) / 100;
    const landlordPayout = (grossRevenue * splitRates.landlord) / 100;

    // Taxas de setup (novos contratos - simulado)
    const newContractsCount = selectedPeriod === "month" ? 2 : selectedPeriod === "quarter" ? 6 : 24;
    const setupRevenue = newContractsCount * setupFees.residential;

    // Receita líquida da plataforma
    const netPlatformRevenue = platformRevenue + setupRevenue;

    // Impostos estimados (simples nacional - 6%)
    const taxRate = 6;
    const estimatedTaxes = (netPlatformRevenue * taxRate) / 100;

    // Lucro líquido
    const netProfit = netPlatformRevenue - estimatedTaxes;

    return {
      grossRevenue,
      platformRevenue,
      insurerRevenue,
      guarantorRevenue,
      landlordPayout,
      setupRevenue,
      newContractsCount,
      netPlatformRevenue,
      taxRate,
      estimatedTaxes,
      netProfit,
      multiplier,
    };
  }, [activeContracts, splitRates, setupFees, selectedPeriod]);

  // Detalhamento por contrato
  const contractBreakdown = useMemo(() => {
    return activeContracts.map((contract) => ({
      id: contract.id,
      property: contract.propertyAddress,
      tenant: contract.tenantName,
      rentValue: contract.rentValue,
      platformFee: (contract.rentValue * splitRates.platform) / 100,
      insurerFee: (contract.rentValue * splitRates.insurer) / 100,
      guarantorFee: (contract.rentValue * splitRates.guarantor) / 100,
      landlordPayout: (contract.rentValue * splitRates.landlord) / 100,
    }));
  }, [activeContracts, splitRates]);

  // Exportar PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Cabeçalho
    doc.setFillColor(30, 64, 175); // Blue-700
    doc.rect(0, 0, pageWidth, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("VINCULO BRASIL", 14, 18);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Demonstrativo de Resultado do Exercício (DRE)", 14, 28);

    // Data e período
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(10);
    const periodLabel = selectedPeriod === "month" ? "Mensal" : selectedPeriod === "quarter" ? "Trimestral" : "Anual";
    doc.text(`Período: ${periodLabel}`, pageWidth - 14, 18, { align: "right" });
    doc.text(`Emissão: ${new Date().toLocaleString("pt-BR")}`, pageWidth - 14, 25, { align: "right" });

    // Resumo Executivo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMO EXECUTIVO", 14, 50);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const summaryData = [
      ["Contratos Ativos", activeContracts.length.toString()],
      ["Faturamento Bruto", formatCurrency(financialData.grossRevenue)],
      ["Receita Plataforma", formatCurrency(financialData.netPlatformRevenue)],
      ["Repasse Proprietários", formatCurrency(financialData.landlordPayout)],
      ["Impostos Estimados", formatCurrency(financialData.estimatedTaxes)],
      ["Lucro Líquido", formatCurrency(financialData.netProfit)],
    ];

    autoTable(doc, {
      startY: 55,
      head: [["Indicador", "Valor"]],
      body: summaryData,
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      margin: { left: 14, right: 14 },
    });

    // Distribuição de Split
    const splitY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DISTRIBUIÇÃO DE SPLIT", 14, splitY);

    const splitData = [
      ["Plataforma Vínculo", `${splitRates.platform}%`, formatCurrency(financialData.platformRevenue)],
      ["Seguradora", `${splitRates.insurer}%`, formatCurrency(financialData.insurerRevenue)],
      ["Garantidor", `${splitRates.guarantor}%`, formatCurrency(financialData.guarantorRevenue)],
      ["Proprietário", `${splitRates.landlord}%`, formatCurrency(financialData.landlordPayout)],
      ["TOTAL", "100%", formatCurrency(financialData.grossRevenue)],
    ];

    autoTable(doc, {
      startY: splitY + 5,
      head: [["Participante", "Percentual", "Valor"]],
      body: splitData,
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      margin: { left: 14, right: 14 },
    });

    // Detalhamento por Contrato
    const detailY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DETALHAMENTO POR CONTRATO", 14, detailY);

    const contractData = contractBreakdown.map((c) => [
      c.property.slice(0, 25) + (c.property.length > 25 ? "..." : ""),
      c.tenant.slice(0, 20) + (c.tenant.length > 20 ? "..." : ""),
      formatCurrency(c.rentValue),
      formatCurrency(c.platformFee),
      formatCurrency(c.landlordPayout),
    ]);

    autoTable(doc, {
      startY: detailY + 5,
      head: [["Imóvel", "Inquilino", "Aluguel", "Taxa Plat.", "Repasse"]],
      body: contractData,
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      margin: { left: 14, right: 14 },
    });

    // Rodapé
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "Documento gerado eletronicamente pela plataforma Vínculo Brasil - vinculo.io",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    }

    // Salvar
    const fileName = `DRE_VinculoBrasil_${selectedPeriod}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    toast.success("Relatório DRE exportado com sucesso!");
  };

  const periodLabels = {
    month: "Mensal",
    quarter: "Trimestral",
    year: "Anual",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <PieChart className="text-green-600" size={28} />
            Financeiro & DRE
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Demonstrativo de Resultado baseado nas Regras de Negócio
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de Período */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "month" | "quarter" | "year")}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="month">Mensal</option>
            <option value="quarter">Trimestral</option>
            <option value="year">Anual</option>
          </select>

          {/* Botão Exportar */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Exportar DRE Oficial
          </button>
        </div>
      </div>

      {/* Info sobre Regras de Negócio */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
        <Percent className="text-blue-600 dark:text-blue-400" size={20} />
        <div>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <span className="font-medium">Regras Aplicadas:</span> Plataforma {splitRates.platform}% | Seguradora {splitRates.insurer}% | Garantidor {splitRates.guarantor}% | Proprietário {splitRates.landlord}%
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-500">
            Última atualização: {new Date(lastUpdated).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={DollarSign}
          label="Faturamento Bruto"
          value={formatCurrency(financialData.grossRevenue)}
          subtitle={`${periodLabels[selectedPeriod]}`}
          color="blue"
        />
        <KPICard
          icon={Building2}
          label="Repasse Proprietários"
          value={formatCurrency(financialData.landlordPayout)}
          subtitle={`${splitRates.landlord}% do faturamento`}
          color="purple"
        />
        <KPICard
          icon={TrendingUp}
          label="Receita Plataforma"
          value={formatCurrency(financialData.netPlatformRevenue)}
          subtitle={`Inclui ${financialData.newContractsCount} setups`}
          color="green"
        />
        <KPICard
          icon={TrendingDown}
          label="Impostos Estimados"
          value={formatCurrency(financialData.estimatedTaxes)}
          subtitle={`Simples Nacional (${financialData.taxRate}%)`}
          color="red"
        />
      </div>

      {/* DRE Detalhado */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tabela DRE */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText size={20} />
            DRE - Período {periodLabels[selectedPeriod]}
          </h2>

          <div className="space-y-3">
            <DRELine label="Faturamento Bruto" value={financialData.grossRevenue} bold />
            <DRELine label="(-) Repasse Proprietários" value={-financialData.landlordPayout} indent />
            <DRELine label="(-) Taxa Seguradora" value={-financialData.insurerRevenue} indent />
            <DRELine label="(-) Taxa Garantidor" value={-financialData.guarantorRevenue} indent />
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
            <DRELine label="= Receita Plataforma (Splits)" value={financialData.platformRevenue} bold />
            <DRELine label="(+) Taxas de Setup" value={financialData.setupRevenue} indent positive />
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
            <DRELine label="= Receita Operacional Líquida" value={financialData.netPlatformRevenue} bold highlight />
            <DRELine label="(-) Impostos (Simples Nacional)" value={-financialData.estimatedTaxes} indent />
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
            <DRELine label="= LUCRO LÍQUIDO" value={financialData.netProfit} bold highlight success />
          </div>
        </div>

        {/* Distribuição Visual */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Distribuição de Split
          </h2>

          <div className="space-y-4">
            <SplitBar
              label="Proprietário"
              percentage={splitRates.landlord}
              value={financialData.landlordPayout}
              color="bg-emerald-500"
            />
            <SplitBar
              label="Plataforma Vínculo"
              percentage={splitRates.platform}
              value={financialData.platformRevenue}
              color="bg-blue-500"
            />
            <SplitBar
              label="Seguradora"
              percentage={splitRates.insurer}
              value={financialData.insurerRevenue}
              color="bg-purple-500"
            />
            <SplitBar
              label="Garantidor"
              percentage={splitRates.guarantor}
              value={financialData.guarantorRevenue}
              color="bg-orange-500"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">Total</span>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">100%</p>
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(financialData.grossRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhamento por Contrato */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={20} />
            Detalhamento por Contrato ({activeContracts.length} ativos)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Imóvel
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Inquilino
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Aluguel
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Taxa Plataforma
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Repasse
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {contractBreakdown.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{contract.property}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {contract.tenant}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                    {formatCurrency(contract.rentValue)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-blue-600 dark:text-blue-400">
                    {formatCurrency(contract.platformFee)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-600 dark:text-green-400">
                    {formatCurrency(contract.landlordPayout)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <td colSpan={2} className="px-6 py-3 font-semibold text-gray-900 dark:text-white">
                  TOTAIS
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900 dark:text-white">
                  {formatCurrency(activeContracts.reduce((s, c) => s + c.rentValue, 0))}
                </td>
                <td className="px-6 py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(contractBreakdown.reduce((s, c) => s + c.platformFee, 0))}
                </td>
                <td className="px-6 py-3 text-right font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(contractBreakdown.reduce((s, c) => s + c.landlordPayout, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPER FUNCTIONS & COMPONENTS
// ============================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "purple" | "red";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function DRELine({
  label,
  value,
  bold,
  indent,
  highlight,
  success,
  positive,
}: {
  label: string;
  value: number;
  bold?: boolean;
  indent?: boolean;
  highlight?: boolean;
  success?: boolean;
  positive?: boolean;
}) {
  const isNegative = value < 0;

  return (
    <div
      className={`flex items-center justify-between py-2 px-3 rounded-lg ${
        highlight ? "bg-gray-50 dark:bg-gray-800/50" : ""
      } ${indent ? "ml-4" : ""}`}
    >
      <span
        className={`text-sm ${
          bold ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${
          bold ? "font-bold" : "font-medium"
        } ${
          success
            ? "text-green-600 dark:text-green-400"
            : isNegative
            ? "text-red-600 dark:text-red-400"
            : positive
            ? "text-green-600 dark:text-green-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

function SplitBar({
  label,
  percentage,
  value,
  color,
}: {
  label: string;
  percentage: number;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{percentage}%</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right">
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
}
