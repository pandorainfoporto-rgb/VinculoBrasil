import { useState } from "react";
import {
  Home,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Bed,
  Bath,
  Car,
  Ruler,
  X,
} from "lucide-react";
import { usePropertyStore, type Property, type PropertyStatus, type PropertyType } from "../../../stores/usePropertyStore";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ============================================================
// PROPERTIES PAGE - Gestão de Imóveis
// ============================================================

const propertySchema = z.object({
  ownerName: z.string().min(3, "Nome do proprietário obrigatório"),
  address: z.string().min(5, "Endereço obrigatório"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Use a sigla do estado"),
  zipCode: z.string().min(8, "CEP inválido"),
  type: z.enum(["residential", "commercial", "industrial", "rural"]),
  area: z.number().min(1, "Área obrigatória"),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  parkingSpaces: z.number().min(0),
  rentValue: z.number().min(1, "Valor do aluguel obrigatório"),
  condoFee: z.number().min(0),
  iptu: z.number().min(0),
  status: z.enum(["available", "rented", "maintenance", "inactive"]),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export function PropertiesPage() {
  const { properties, addProperty, updateProperty, deleteProperty } = usePropertyStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Simula imobiliária logada (agency-001)
  const currentAgencyId = "agency-001";

  // Filtrar imóveis da imobiliária atual
  const agencyProperties = properties.filter((p) => p.agencyId === currentAgencyId);

  const filteredProperties = agencyProperties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesType = typeFilter === "all" || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
    setOpenMenu(null);
  };

  const handleDelete = (property: Property) => {
    if (confirm(`Tem certeza que deseja excluir o imóvel "${property.address}, ${property.number}"?`)) {
      deleteProperty(property.id);
      toast.success("Imóvel excluído com sucesso!");
    }
    setOpenMenu(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
  };

  // Stats
  const stats = {
    total: agencyProperties.length,
    available: agencyProperties.filter((p) => p.status === "available").length,
    rented: agencyProperties.filter((p) => p.status === "rented").length,
    totalRevenue: agencyProperties
      .filter((p) => p.status === "rented")
      .reduce((sum, p) => sum + p.rentValue, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Home className="text-blue-600" size={28} />
            Meus Imóveis
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os imóveis da sua carteira
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Novo Imóvel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total de Imóveis" value={stats.total} icon={Home} />
        <StatCard label="Disponíveis" value={stats.available} color="green" />
        <StatCard label="Alugados" value={stats.rented} color="blue" />
        <StatCard
          label="Receita Mensal"
          value={`R$ ${stats.totalRevenue.toLocaleString("pt-BR")}`}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por endereço, bairro ou proprietário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PropertyType | "all")}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Tipos</option>
            <option value="residential">Residencial</option>
            <option value="commercial">Comercial</option>
            <option value="industrial">Industrial</option>
            <option value="rural">Rural</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | "all")}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="available">Disponível</option>
            <option value="rented">Alugado</option>
            <option value="maintenance">Manutenção</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onEdit={() => handleEdit(property)}
            onDelete={() => handleDelete(property)}
            onMenuToggle={() => setOpenMenu(openMenu === property.id ? null : property.id)}
            isMenuOpen={openMenu === property.id}
          />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 py-12 text-center">
          <Home className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">Nenhum imóvel encontrado</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Cadastrar primeiro imóvel
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PropertyModal
          property={editingProperty}
          agencyId={currentAgencyId}
          onClose={handleCloseModal}
          onSave={(data) => {
            if (editingProperty) {
              updateProperty(editingProperty.id, data);
              toast.success("Imóvel atualizado com sucesso!");
            } else {
              addProperty({
                ...data,
                agencyId: currentAgencyId,
                ownerId: `owner-${Date.now()}`,
              });
              toast.success("Imóvel cadastrado com sucesso!");
            }
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================
function StatCard({
  label,
  value,
  icon: Icon,
  color = "gray",
}: {
  label: string;
  value: string | number;
  icon?: typeof Home;
  color?: "gray" | "blue" | "green" | "purple";
}) {
  const colors = {
    gray: "text-gray-600 dark:text-gray-400",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className={colors[color]} size={24} />}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROPERTY CARD
// ============================================================
function PropertyCard({
  property,
  onEdit,
  onDelete,
  onMenuToggle,
  isMenuOpen,
}: {
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}) {
  const typeLabels = {
    residential: "Residencial",
    commercial: "Comercial",
    industrial: "Industrial",
    rural: "Rural",
  };

  const statusConfig = {
    available: { label: "Disponível", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    rented: { label: "Alugado", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    maintenance: { label: "Manutenção", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    inactive: { label: "Inativo", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
        <Home className="text-gray-400 dark:text-gray-500" size={48} />
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[property.status].color}`}>
            {statusConfig[property.status].label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={onMenuToggle}
            className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
          >
            <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-10 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-36">
              <button
                onClick={onEdit}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit size={14} />
                Editar
              </button>
              <button
                onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye size={14} />
                Ver Detalhes
              </button>
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{typeLabels[property.type]}</p>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {property.address}, {property.number}
          </h3>
          {property.complement && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{property.complement}</p>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <MapPin size={14} />
          {property.neighborhood}, {property.city}/{property.state}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed size={14} />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath size={14} />
              {property.bathrooms}
            </span>
          )}
          {property.parkingSpaces > 0 && (
            <span className="flex items-center gap-1">
              <Car size={14} />
              {property.parkingSpaces}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler size={14} />
            {property.area}m²
          </span>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Proprietário</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{property.ownerName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Aluguel</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                R$ {property.rentValue.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROPERTY MODAL
// ============================================================
function PropertyModal({
  property,
  agencyId,
  onClose,
  onSave,
}: {
  property: Property | null;
  agencyId: string;
  onClose: () => void;
  onSave: (data: PropertyFormData & { agencyId: string; ownerId: string }) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          ownerName: property.ownerName,
          address: property.address,
          number: property.number,
          complement: property.complement || "",
          neighborhood: property.neighborhood,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode,
          type: property.type,
          area: property.area,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          parkingSpaces: property.parkingSpaces,
          rentValue: property.rentValue,
          condoFee: property.condoFee,
          iptu: property.iptu,
          status: property.status,
        }
      : {
          type: "residential",
          status: "available",
          bedrooms: 0,
          bathrooms: 0,
          parkingSpaces: 0,
          condoFee: 0,
          iptu: 0,
        },
  });

  const onSubmit = (data: PropertyFormData) => {
    onSave({
      ...data,
      agencyId,
      ownerId: property?.ownerId || `owner-${Date.now()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {property ? "Editar Imóvel" : "Novo Imóvel"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Proprietário */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Proprietário
            </h3>
            <input
              {...register("ownerName")}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              placeholder="Nome do proprietário"
            />
            {errors.ownerName && (
              <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>
            )}
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Endereço
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  {...register("address")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Rua/Avenida"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
              <div>
                <input
                  {...register("number")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Número"
                />
              </div>
              <div>
                <input
                  {...register("complement")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Complemento"
                />
              </div>
              <div>
                <input
                  {...register("neighborhood")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Bairro"
                />
              </div>
              <div>
                <input
                  {...register("city")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Cidade"
                />
              </div>
              <div>
                <input
                  {...register("state")}
                  maxLength={2}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white uppercase"
                  placeholder="UF"
                />
              </div>
              <div>
                <input
                  {...register("zipCode")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="CEP"
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Características
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Tipo</label>
                <select
                  {...register("type")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="residential">Residencial</option>
                  <option value="commercial">Comercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="rural">Rural</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Área (m²)</label>
                <input
                  {...register("area", { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Quartos</label>
                <input
                  {...register("bedrooms", { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Banheiros</label>
                <input
                  {...register("bathrooms", { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Vagas</label>
                <input
                  {...register("parkingSpaces", { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Valores */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Valores (R$)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Aluguel</label>
                <input
                  {...register("rentValue", { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
                {errors.rentValue && <p className="text-red-500 text-xs mt-1">{errors.rentValue.message}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Condomínio</label>
                <input
                  {...register("condoFee", { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">IPTU</label>
                <input
                  {...register("iptu", { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                <select
                  {...register("status")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="available">Disponível</option>
                  <option value="rented">Alugado</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {property ? "Salvar Alterações" : "Cadastrar Imóvel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
