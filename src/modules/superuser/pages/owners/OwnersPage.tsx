
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Users,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Loader2,
    AlertCircle,
    Eye,
    Building2,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

import { ownerService, type Owner } from "../../../../services/ownerService";
import { OwnerForm } from "./components/OwnerForm";

export function OwnersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

    const {
        data: ownersData,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["owners", searchTerm],
        queryFn: () => ownerService.getOwners({ search: searchTerm }),
    });

    const owners = ownersData?.data || [];
    const meta = ownersData?.meta;

    const handleEdit = (owner: Owner) => {
        setSelectedOwner(owner);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedOwner(null);
    };

    const handleSuccess = () => {
        handleClose();
        refetch();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="text-blue-600" size={28} />
                        Proprietários
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerenciamento completo de proprietários e seus vínculos
                    </p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setSelectedOwner(null)}
                        >
                            <Plus size={18} />
                            Novo Proprietário
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedOwner ? "Editar Proprietário" : "Novo Proprietário"}
                            </DialogTitle>
                        </DialogHeader>
                        <OwnerForm
                            owner={selectedOwner}
                            onClose={handleClose}
                            onSuccess={handleSuccess}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="Buscar por nome, CPF ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 max-w-md"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center p-12 text-red-600">
                        <AlertCircle size={48} />
                        <p className="mt-4">Erro ao carregar proprietários</p>
                    </div>
                ) : owners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                        <Users size={48} className="mb-4 opacity-50" />
                        <p>Nenhum proprietário encontrado</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">CPF/CNPJ</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contato</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Cidade</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {owners.map((owner: Owner) => (
                                    <tr key={owner.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                                                    {owner.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{owner.user.name}</p>
                                                    <p className="text-xs text-gray-500">{owner.profession || "Proprietário"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {owner.cpfCnpj}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                <p>{owner.user.email}</p>
                                                <p className="text-xs text-gray-400">{owner.user.phone || "-"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {owner.address?.city}/{owner.address?.state || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(owner)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    {/* <DropdownMenuItem onClick={() => console.log("View", owner.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem> */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
