import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "../../../../services/financeService";
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Filter,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import type { FinancialCategory, CategoryAccountType, CategoryNature } from "../../../../types/finance";

// ============================================================
// CATEGORIES PAGE - Plano de Contas Hierarquico (FASE 23)
// UX: F2 para busca, Visualizacao em Arvore, Level Automatico
// ============================================================

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // F2 Hotkey - Foca na busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Query - Fetch Categories
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => financeService.getCategories(),
  });

  // Mutation - Delete Category
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover categoria");
    },
  });

  // Normalize categories
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Filter categories by search term and type
  const filteredCategories = safeCategories.filter((c) => {
    const matchesSearch =
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  // Sort by level and code for tree display
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    // First by level
    const levelDiff = (a.level || 1) - (b.level || 1);
    if (levelDiff !== 0) return levelDiff;
    // Then by code
    return (a.code || "").localeCompare(b.code || "");
  });

  // Build tree structure for display
  const buildDisplayTree = (cats: FinancialCategory[]) => {
    const rootCategories = cats.filter(c => !c.parentId);
    const childMap = new Map<string, FinancialCategory[]>();

    cats.forEach(c => {
      if (c.parentId) {
        if (!childMap.has(c.parentId)) {
          childMap.set(c.parentId, []);
        }
        childMap.get(c.parentId)!.push(c);
      }
    });

    const flatList: (FinancialCategory & { hasChildren: boolean })[] = [];

    const addToList = (cat: FinancialCategory) => {
      const children = childMap.get(cat.id) || [];
      flatList.push({ ...cat, hasChildren: children.length > 0 });

      if (expandedIds.has(cat.id)) {
        children
          .sort((a, b) => (a.code || "").localeCompare(b.code || ""))
          .forEach(child => addToList(child));
      }
    };

    rootCategories
      .sort((a, b) => (a.code || "").localeCompare(b.code || ""))
      .forEach(cat => addToList(cat));

    return flatList;
  };

  const displayCategories = searchTerm ? sortedCategories : buildDisplayTree(safeCategories.filter(c =>
    filterType === "all" || c.type === filterType
  ));

  // Stats
  const expenseCount = safeCategories.filter((c) => c.type === "EXPENSE").length;
  const incomeCount = safeCategories.filter((c) => c.type === "INCOME").length;
  const syntheticCount = safeCategories.filter((c) => c.categoryType === "SYNTHETIC").length;
  const analyticalCount = safeCategories.filter((c) => c.categoryType === "ANALYTICAL").length;

  const handleDelete = (id: string) => {
    if (window.confirm("Confirmar exclusao desta categoria?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (category: FinancialCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(safeCategories.map(c => c.id));
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FolderTree className="text-purple-600" size={32} />
            Plano de Contas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            DRE Hierarquico com Sintetico/Analitico | <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">F2</kbd> para buscar
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus size={18} />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderTree size={20} />
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              onClose={handleCloseModal}
              editingCategory={editingCategory}
              categories={safeCategories}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Despesas</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {expenseCount}
              </p>
            </div>
            <div className="w-11 h-11 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-red-600 dark:text-red-400" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receitas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {incomeCount}
              </p>
            </div>
            <div className="w-11 h-11 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600 dark:text-green-400" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sinteticas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {syntheticCount}
              </p>
            </div>
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Folder className="text-blue-600 dark:text-blue-400" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analiticas</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {analyticalCount}
              </p>
            </div>
            <div className="w-11 h-11 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
              <FileText className="text-orange-600 dark:text-orange-400" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              ref={searchInputRef}
              placeholder="Buscar por nome ou codigo... (F2)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="EXPENSE">Despesas</SelectItem>
                <SelectItem value="INCOME">Receitas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expandir
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Recolher
            </Button>
          </div>
        </div>
      </div>

      {/* Tree Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-600">
            <AlertCircle size={48} />
            <p className="mt-4 text-lg font-medium">Erro ao carregar dados</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verifique a conexao com o backend
            </p>
          </div>
        ) : displayCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FolderTree size={48} />
            <p className="mt-4 text-lg font-medium">Nenhuma categoria encontrada</p>
            <p className="text-sm">Clique em "Nova Categoria" para cadastrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Codigo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Conta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Natureza
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayCategories.map((category) => {
                  const level = category.level || 1;
                  const indent = (level - 1) * 24;
                  const hasChildren = (category as any).hasChildren;
                  const isExpanded = expandedIds.has(category.id);

                  return (
                    <tr
                      key={category.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                        category.categoryType === "SYNTHETIC" ? "bg-gray-50/50 dark:bg-gray-800/50" : ""
                      }`}
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div
                          className="flex items-center gap-2"
                          style={{ paddingLeft: `${indent}px` }}
                        >
                          {!searchTerm && hasChildren ? (
                            <button
                              onClick={() => toggleExpand(category.id)}
                              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          ) : (
                            <span className="w-5" />
                          )}

                          <div className={`w-8 h-8 rounded flex items-center justify-center ${
                            category.type === "EXPENSE"
                              ? "bg-red-100 dark:bg-red-900/20"
                              : "bg-green-100 dark:bg-green-900/20"
                          }`}>
                            {category.categoryType === "SYNTHETIC" ? (
                              <Folder className={category.type === "EXPENSE" ? "text-red-600" : "text-green-600"} size={16} />
                            ) : (
                              <FileText className={category.type === "EXPENSE" ? "text-red-600" : "text-green-600"} size={16} />
                            )}
                          </div>

                          <span className={`text-sm ${
                            category.categoryType === "SYNTHETIC"
                              ? "font-semibold text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}>
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {category.code || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          category.type === "EXPENSE"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        }`}>
                          {category.type === "EXPENSE" ? "Despesa" : "Receita"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          category.categoryType === "SYNTHETIC"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                        }`}>
                          {category.categoryType === "SYNTHETIC" ? "Sintetica" : "Analitica"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          category.nature === "DEBIT"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                            : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400"
                        }`}>
                          {category.nature === "DEBIT" ? "Debito" : "Credito"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                          {category.level || 1}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CATEGORY FORM COMPONENT - Enterprise com Hierarquia
// ============================================================

function CategoryForm({
  onClose,
  editingCategory,
  categories,
}: {
  onClose: () => void;
  editingCategory: FinancialCategory | null;
  categories: FinancialCategory[];
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    type: "EXPENSE" | "INCOME";
    categoryType: CategoryAccountType;
    nature: CategoryNature;
    description: string;
    parentId: string;
    isActive: boolean;
  }>({
    name: editingCategory?.name || "",
    code: editingCategory?.code || "",
    type: editingCategory?.type === "INCOME" ? "INCOME" : "EXPENSE",
    categoryType: editingCategory?.categoryType || "ANALYTICAL",
    nature: editingCategory?.nature || "DEBIT",
    description: editingCategory?.description || "",
    parentId: editingCategory?.parentId || "",
    isActive: editingCategory?.isActive !== false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<FinancialCategory>) => financeService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria criada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao criar categoria");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<FinancialCategory>) =>
      financeService.updateCategory(editingCategory!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria atualizada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar categoria");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      parentId: formData.parentId || undefined,
    };
    if (editingCategory) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // Categorias disponiveis como pai (exclui a propria categoria em edicao)
  // Filtra apenas categorias do mesmo tipo
  const parentOptions = categories.filter(
    (c) => c.id !== editingCategory?.id && c.type === formData.type
  );

  // Auto-set nature based on type
  useEffect(() => {
    if (formData.type === "EXPENSE" && formData.nature === "CREDIT") {
      setFormData(prev => ({ ...prev, nature: "DEBIT" }));
    } else if (formData.type === "INCOME" && formData.nature === "DEBIT") {
      setFormData(prev => ({ ...prev, nature: "CREDIT" }));
    }
  }, [formData.type]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Codigo Contabil</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Ex: 4.1.01"
          />
        </div>
        <div>
          <Label htmlFor="type">Tipo *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "EXPENSE" | "INCOME") => setFormData({ ...formData, type: value, parentId: "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Despesa</SelectItem>
              <SelectItem value="INCOME">Receita</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome da categoria"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoryType">Tipo de Conta</Label>
          <Select
            value={formData.categoryType}
            onValueChange={(value: CategoryAccountType) => setFormData({ ...formData, categoryType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SYNTHETIC">Sintetica (Grupo)</SelectItem>
              <SelectItem value="ANALYTICAL">Analitica (Lancamento)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Sintetica = agrupadora | Analitica = recebe lancamentos
          </p>
        </div>
        <div>
          <Label htmlFor="nature">Natureza</Label>
          <Select
            value={formData.nature}
            onValueChange={(value: CategoryNature) => setFormData({ ...formData, nature: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DEBIT">Devedora (Debito)</SelectItem>
              <SelectItem value="CREDIT">Credora (Credito)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="parentId">Categoria Pai (Hierarquia)</Label>
        <Select
          value={formData.parentId}
          onValueChange={(value: string) => setFormData({ ...formData, parentId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Nenhuma (Raiz)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhuma (Raiz - Nivel 1)</SelectItem>
            {parentOptions.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span style={{ paddingLeft: `${((cat.level || 1) - 1) * 12}px` }}>
                  {cat.code ? `${cat.code} - ` : ""}{cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          O nivel sera calculado automaticamente (Pai.nivel + 1)
        </p>
      </div>

      <div>
        <Label htmlFor="description">Descricao</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descricao opcional"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Categoria ativa
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {createMutation.isPending || updateMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Salvando...
            </>
          ) : editingCategory ? (
            "Atualizar"
          ) : (
            "Criar Categoria"
          )}
        </Button>
      </div>
    </form>
  );
}
