
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Save, Wallet, RefreshCw, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../../components/ui/select";

import { investorService, type Investor } from "../../../../../services/investorService";

const formSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(11, "CPF inválido").optional(),
    phone: z.string().optional(),
    kycLevel: z.string().optional(),
    vbrzBalance: z.string().optional(),
    walletAddress: z.string().optional(),
});

type InvestorFormData = z.infer<typeof formSchema>;

interface InvestorFormProps {
    investor: Investor | null | undefined;
    isEditing: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function InvestorForm({ investor, isEditing, onClose, onSuccess }: InvestorFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset
    } = useForm<InvestorFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            cpf: "",
            phone: "",
            kycLevel: "1",
            vbrzBalance: "",
            walletAddress: "",
        },
    });

    useEffect(() => {
        if (investor) {
            reset({
                name: investor.user.name,
                email: investor.user.email,
                cpf: investor.user.cpf,
                phone: investor.user.phone,
                kycLevel: investor.kycLevel.toString(),
                vbrzBalance: investor.vbrzBalance?.toString() || "0",
                walletAddress: investor.walletAddress || "",
            });
        }
    }, [investor, reset]);

    const onSubmit = async (values: InvestorFormData) => {
        try {
            const payload = {
                ...values,
                kycLevel: values.kycLevel ? Number(values.kycLevel) : 1,
                vbrzBalance: values.vbrzBalance ? Number(values.vbrzBalance) : 0,
            };

            if (isEditing && investor) {
                await investorService.update(investor.id, payload);
                toast.success("Investidor atualizado com sucesso!");
            } else {
                await investorService.create(payload as any);
                toast.success("Investidor criado com sucesso!");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar investidor.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">Perfil & Compliance</TabsTrigger>
                    <TabsTrigger value="wallet">Carteira VBRz</TabsTrigger>
                    <TabsTrigger value="p2p">Alocações P2P</TabsTrigger>
                    <TabsTrigger value="tickets">Chamados</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome Completo*</Label>
                            <Input {...register("name")} placeholder="Nome do investidor" />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>CPF</Label>
                            <Input {...register("cpf")} placeholder="000.000.000-00" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email*</Label>
                            <Input {...register("email")} placeholder="email@exemplo.com" />
                            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input {...register("phone")} placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Nível KYC (Compliance)</Label>
                        <Select onValueChange={(v) => setValue("kycLevel", v)} defaultValue="1">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Nível 1 - Básico (Cadastro)</SelectItem>
                                <SelectItem value="2">Nível 2 - Verificado (Docs)</SelectItem>
                                <SelectItem value="3">Nível 3 - Qualificado (Renda)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>

                <TabsContent value="wallet" className="mt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg bg-muted/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="h-4 w-4 text-emerald-500" />
                                <h3 className="font-medium text-sm">Saldo de Tokens</h3>
                            </div>
                            <div className="text-2xl font-bold">
                                {Number(investor?.vbrzBalance || 0).toLocaleString('pt-BR')} VBRz
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Utility Tokens disponíveis para uso.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Endereço da Carteira (EVM)</Label>
                            <Input {...register("walletAddress")} placeholder="0x..." />
                            <p className="text-xs text-muted-foreground">Endereço público da wallet do investidor.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ajuste Manual de Saldo (Admin)</Label>
                        <Input type="number" step="0.01" {...register("vbrzBalance")} placeholder="0.00" />
                        <p className="text-xs text-rose-500">Cuidado: Alterar este valor impacta diretamente a circulação de tokens.</p>
                    </div>

                    <div className="border rounded-md p-4 mt-4">
                        <h4 className="font-medium mb-3 text-sm flex items-center">
                            <RefreshCw className="h-3 w-3 mr-2" /> Extrato Recente (Simulado)
                        </h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                                <span className="flex items-center"><ArrowUpRight className="h-3 w-3 text-emerald-500 mr-2" /> Compra de VBRz</span>
                                <span>+ 1,000.00</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                                <span className="flex items-center"><ArrowDownLeft className="h-3 w-3 text-rose-500 mr-2" /> Uso em Cashback</span>
                                <span>- 50.00</span>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="p2p" className="mt-4">
                    <div className="border rounded-md p-8 text-center text-muted-foreground bg-muted/10">
                        <p>Este investidor não possui contratos de Cessão de Crédito ativos.</p>
                        <Button variant="ghost" className="mt-2 text-blue-600 hover:text-blue-700">Ver Marketplace P2P</Button>
                    </div>
                </TabsContent>

                <TabsContent value="tickets" className="mt-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Solicitações de Suporte</h3>
                        </div>
                        <div className="border rounded-md p-4 bg-muted/50 text-center">
                            Nenhuma solicitação ativa no momento.
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar
                </Button>
            </div>
        </form>
    );
}
