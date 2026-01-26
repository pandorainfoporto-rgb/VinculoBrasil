
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    User,
    MapPin,
    CreditCard,
    Building2,
    Save,
    X,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../../../../components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../../components/ui/select";

import { ownerService, type CreateOwnerPayload, type Owner } from "../../../../../services/ownerService";
import { financeService } from "../../../../../services/financeService";

// Schema Validation
const ownerSchema = z.object({
    // Personal
    name: z.string().min(3, "Nome obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    cpf: z.string().min(11, "CPF inválido"), // Add better validation logic if needed
    rgIe: z.string().optional(),
    birthDate: z.string().optional(),
    profession: z.string().optional(),
    maritalStatus: z.string().optional(),

    // Address
    zipCode: z.string().min(8, "CEP inválido"),
    street: z.string().min(3, "Rua obrigatória"),
    number: z.string().min(1, "Número obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro obrigatório"),
    city: z.string().min(2, "Cidade obrigatória"),
    state: z.string().length(2, "Estado inválido (UF)"),

    // Bank (Optional fields handling logic is custom inside component submit)
    bankCode: z.string().optional(),
    bankName: z.string().optional(),
    agencyNumber: z.string().optional(),
    accountNumber: z.string().optional(),
    accountType: z.enum(["CHECKING", "SAVINGS"]).optional(),
    pixKey: z.string().optional(),
    pixKeyType: z.enum(["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"]).optional(),
});

type OwnerFormData = z.infer<typeof ownerSchema>;

interface OwnerFormProps {
    owner?: Owner | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function OwnerForm({ owner, onClose, onSuccess }: OwnerFormProps) {
    const [activeTab, setActiveTab] = useState("personal");
    const [banks, setBanks] = useState<any[]>([]);

    // Fetch Banks
    const { data: bankRegistry } = useQuery({
        queryKey: ["bankRegistry"],
        queryFn: () => financeService.getBankRegistry(),
    });

    useEffect(() => {
        if (bankRegistry) {
            setBanks(bankRegistry);
        }
    }, [bankRegistry]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<OwnerFormData>({
        resolver: zodResolver(ownerSchema),
        defaultValues: owner
            ? {
                name: owner.user.name,
                email: owner.user.email,
                phone: owner.user.phone,
                cpf: owner.cpfCnpj,
                rgIe: owner.rgIe,
                birthDate: owner.birthDate ? new Date(owner.birthDate).toISOString().split('T')[0] : "",
                profession: owner.profession,
                maritalStatus: owner.maritalStatus,
                zipCode: owner.address?.zipCode,
                street: owner.address?.street,
                number: owner.address?.number,
                complement: owner.address?.complement,
                neighborhood: owner.address?.neighborhood,
                city: owner.address?.city,
                state: owner.address?.state,
                // Bank - Access first one if exists
                bankCode: owner.bankAccounts?.[0]?.bankCode,
                bankName: owner.bankAccounts?.[0]?.bankName,
                agencyNumber: owner.bankAccounts?.[0]?.agencyNumber,
                accountNumber: owner.bankAccounts?.[0]?.accountNumber,
                accountType: owner.bankAccounts?.[0]?.type as any,
                pixKey: owner.bankAccounts?.[0]?.pixKey,
                // pixKeyType: owner.bankAccounts?.[0]?.pixKeyType as any, 
            }
            : {
                accountType: "CHECKING",
            },
    });

    const onSubmit = async (data: OwnerFormData) => {
        try {
            const payload: CreateOwnerPayload = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: data.cpf,
                rgIe: data.rgIe,
                birthDate: data.birthDate,
                profession: data.profession,
                maritalStatus: data.maritalStatus,
                zipCode: data.zipCode,
                street: data.street,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,

                bankAccount: data.bankCode ? {
                    bankCode: data.bankCode,
                    bankName: banks.find(b => b.code === data.bankCode)?.name || data.bankName,
                    agencyNumber: data.agencyNumber!,
                    accountNumber: data.accountNumber!,
                    accountType: data.accountType || "CHECKING",
                    pixKey: data.pixKey,
                    pixKeyType: data.pixKeyType
                } : undefined
            };

            if (owner) {
                await ownerService.updateOwner(owner.id, payload);
                toast.success("Proprietário atualizado com sucesso!");
            } else {
                await ownerService.createOwner(payload);
                toast.success("Proprietário criado com sucesso!");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar proprietário");
        }
    };

    // CEP Search
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setValue("street", data.logradouro);
                    setValue("neighborhood", data.bairro);
                    setValue("city", data.localidade);
                    setValue("state", data.uf);
                }
            } catch (error) {
                console.error("Erro ao buscar CEP");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="personal" className="flex gap-2">
                            <User size={18} />
                            Pessoal
                        </TabsTrigger>
                        <TabsTrigger value="address" className="flex gap-2">
                            <MapPin size={18} />
                            Endereço
                        </TabsTrigger>
                        <TabsTrigger value="bank" className="flex gap-2">
                            <CreditCard size={18} />
                            Bancário
                        </TabsTrigger>
                    </TabsList>

                    {/* PERSONAL TAB */}
                    <TabsContent value="personal" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome Completo *</Label>
                                <Input {...register("name")} placeholder="Ex: João da Silva" />
                                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>CPF *</Label>
                                <Input {...register("cpf")} placeholder="000.000.000-00" />
                                {errors.cpf && <span className="text-red-500 text-xs">{errors.cpf.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input {...register("email")} type="email" placeholder="joao@email.com" />
                                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input {...register("phone")} placeholder="(11) 99999-9999" />
                            </div>
                            <div className="space-y-2">
                                <Label>RG / IE</Label>
                                <Input {...register("rgIe")} placeholder="RG ou Inscrição Estadual" />
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Nascimento</Label>
                                <Input {...register("birthDate")} type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label>Profissão</Label>
                                <Input {...register("profession")} placeholder="Ex: Engenheiro" />
                            </div>
                            <div className="space-y-2">
                                <Label>Estado Civil</Label>
                                <Select onValueChange={(v) => setValue("maritalStatus", v)} defaultValue={owner?.maritalStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
                                        <SelectItem value="CASADO">Casado(a)</SelectItem>
                                        <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
                                        <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
                                        <SelectItem value="UNIAO_ESTAVEL">União Estável</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ADDRESS TAB */}
                    <TabsContent value="address" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>CEP *</Label>
                                <Input {...register("zipCode")} onBlur={handleCepBlur} placeholder="00000-000" />
                                {errors.zipCode && <span className="text-red-500 text-xs">{errors.zipCode.message}</span>}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Rua *</Label>
                                <Input {...register("street")} placeholder="Rua..." />
                                {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Número *</Label>
                                <Input {...register("number")} placeholder="123" />
                                {errors.number && <span className="text-red-500 text-xs">{errors.number.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Complemento</Label>
                                <Input {...register("complement")} placeholder="Apto 101" />
                            </div>
                            <div className="space-y-2">
                                <Label>Bairro *</Label>
                                <Input {...register("neighborhood")} placeholder="Bairro" />
                                {errors.neighborhood && <span className="text-red-500 text-xs">{errors.neighborhood.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Cidade *</Label>
                                <Input {...register("city")} placeholder="Cidade" />
                                {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Estado (UF) *</Label>
                                <Input {...register("state")} maxLength={2} placeholder="UF" />
                                {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
                            </div>
                        </div>
                    </TabsContent>

                    {/* BANK TAB */}
                    <TabsContent value="bank" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Banco</Label>
                                <Select
                                    onValueChange={(val) => {
                                        setValue("bankCode", val);
                                        const bank = banks.find(b => b.code === val);
                                        if (bank) setValue("bankName", bank.name);
                                    }}
                                    defaultValue={owner?.bankAccounts?.[0]?.bankCode}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o Banco..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {banks.map((bank: any) => (
                                            <SelectItem key={bank.code} value={bank.code}>
                                                {bank.code} - {bank.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Agência</Label>
                                <Input {...register("agencyNumber")} placeholder="0001" />
                            </div>
                            <div className="space-y-2">
                                <Label>Conta</Label>
                                <Input {...register("accountNumber")} placeholder="00000-0" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Conta</Label>
                                <Select onValueChange={(v) => setValue("accountType", v as any)} defaultValue={watch("accountType")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CHECKING">Conta Corrente</SelectItem>
                                        <SelectItem value="SAVINGS">Conta Poupança</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Chave Pix</Label>
                                <Input {...register("pixKey")} placeholder="Chave Pix" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Chave Pix</Label>
                                <Select onValueChange={(v) => setValue("pixKeyType", v as any)} defaultValue={watch("pixKeyType")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CPF">CPF</SelectItem>
                                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                                        <SelectItem value="EMAIL">Email</SelectItem>
                                        <SelectItem value="PHONE">Telefone</SelectItem>
                                        <SelectItem value="RANDOM">Aleatória</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                    <Save size={18} />
                    {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </form>
    );
}
