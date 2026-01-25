import { Wallet, FileText, Gift, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";

export function TenantDashboard() {
  const { cashbackRules } = useBusinessRulesStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Área do Inquilino</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerencie seus pagamentos e vistorias</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Wallet}
          label="Próximo Pagamento"
          value="R$ 2.500"
          subtitle="Vence em 05/02/2024"
          color="blue"
        />
        <StatCard
          icon={Gift}
          label="Cashback Acumulado"
          value="R$ 156,80"
          subtitle={`${cashbackRules.onTimePayment}% por pagamento em dia`}
          color="green"
        />
        <StatCard
          icon={FileText}
          label="Contrato"
          value="Ativo"
          subtitle="Válido até 12/2025"
          color="purple"
        />
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Histórico de Pagamentos</h2>
        <div className="space-y-3">
          <PaymentItem
            month="Janeiro 2024"
            value="R$ 2.500"
            status="paid"
            cashback="R$ 25,00"
          />
          <PaymentItem
            month="Dezembro 2023"
            value="R$ 2.500"
            status="paid"
            cashback="R$ 25,00"
          />
          <PaymentItem
            month="Novembro 2023"
            value="R$ 2.500"
            status="paid"
            cashback="R$ 25,00"
          />
        </div>
      </div>

      {/* Inspections */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vistorias</h2>
        <div className="space-y-3">
          <InspectionItem
            type="Entrada"
            date="15/01/2024"
            status="completed"
          />
          <InspectionItem
            type="Periódica"
            date="15/07/2024"
            status="scheduled"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "purple";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function PaymentItem({
  month,
  value,
  status,
  cashback,
}: {
  month: string;
  value: string;
  status: "paid" | "pending" | "overdue";
  cashback?: string;
}) {
  const statusConfig = {
    paid: { icon: CheckCircle, color: "text-green-600 dark:text-green-400", label: "Pago" },
    pending: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", label: "Pendente" },
    overdue: { icon: AlertCircle, color: "text-red-600 dark:text-red-400", label: "Atrasado" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <config.icon className={config.color} size={20} />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{month}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{config.label}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
        {cashback && (
          <p className="text-xs text-green-600 dark:text-green-400">+{cashback} cashback</p>
        )}
      </div>
    </div>
  );
}

function InspectionItem({
  type,
  date,
  status,
}: {
  type: string;
  date: string;
  status: "completed" | "scheduled" | "pending";
}) {
  const statusConfig = {
    completed: { color: "bg-green-100 text-green-700", label: "Concluída" },
    scheduled: { color: "bg-blue-100 text-blue-700", label: "Agendada" },
    pending: { color: "bg-yellow-100 text-yellow-700", label: "Pendente" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">Vistoria de {type}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
      </div>
      <span className={`text-xs px-3 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
