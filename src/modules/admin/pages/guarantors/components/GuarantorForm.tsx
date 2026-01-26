
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, FileText, Save, Info } from "lucide-react";
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


import { guarantorService, type Guarantor } from "../../../../../services/guarantorService";

const formSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(11, "CPF inválido").optional(),
    phone: z.string().optional(),
    totalCollateral: z.string().optional(),
    availableLimit: z.string().optional(),
    blockedAmount: z.string().optional(),
    investorProfile: z.enum(["CONSERVATIVE", "MODERATE", "AGGRESSIVE"]).optional(),
    kycStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

type GuarantorFormData = z.infer<typeof formSchema>;

interface GuarantorFormProps {
    guarantor: Guarantor | null | undefined;
    isEditing: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function GuarantorForm({ guarantor, isEditing, onClose, onSuccess }: GuarantorFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset
    } = useForm<GuarantorFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            cpf: "",
            phone: "",
            totalCollateral: "",
            availableLimit: "",
            blockedAmount: "",
            investorProfile: "CONSERVATIVE",
            kycStatus: "PENDING",
        },
    });

    useEffect(() => {
        if (guarantor) {
            reset({
                name: guarantor.user.name,
                email: guarantor.user.email,
                cpf: guarantor.user.cpf,
                phone: guarantor.user.phone,
                totalCollateral: guarantor.totalCollateral?.toString() || "",
                availableLimit: guarantor.availableLimit?.toString() || "",
                blockedAmount: guarantor.blockedAmount?.toString() || "",
                investorProfile: guarantor.investorProfile,
                kycStatus: guarantor.kycStatus,
            });
        }
    }, [guarantor, reset]);

    const onSubmit = async (values: GuarantorFormData) => {
        try {
            const payload = {
                ...values,
                totalCollateral: values.totalCollateral ? Number(values.totalCollateral) : 0,
                availableLimit: values.availableLimit ? Number(values.availableLimit) : 0,
                blockedAmount: values.blockedAmount ? Number(values.blockedAmount) : 0,
            };

            if (isEditing && guarantor) {
                await guarantorService.update(guarantor.id, payload);
                toast.success("Garantidor atualizado com sucesso!");
            } else {
                await guarantorService.create(payload as any);
                toast.success("Garantidor criado com sucesso!");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar garantidor.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                    <TabsTrigger value="financial">Financeiro & Risco</TabsTrigger>
                    <TabsTrigger value="docs">Documentos</TabsTrigger>
                    <TabsTrigger value="requests">Solicitações</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome Completo*</Label>
                            <Input {...register("name")} placeholder="Nome do garantidor" />
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
                </TabsContent>

                <TabsContent value="financial" className="mt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Total em Garantia (R$)</Label>
                            <Input type="number" step="0.01" {...register("totalCollateral")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Limite Disponível (R$)</Label>
                            <Input type="number" step="0.01" {...register("availableLimit")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Valor Bloqueado (R$)</Label>
                            <Input type="number" step="0.01" {...register("blockedAmount")} disabled />
                            <span className="text-xs text-muted-foreground">Automático via contratos ativos.</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Perfil de Investidor</Label>
                            <Select onValueChange={(v) => setValue("investorProfile", v as any)} defaultValue="CONSERVATIVE">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CONSERVATIVE">Conservador</SelectItem>
                                    <SelectItem value="MODERATE">Moderado</SelectItem>
                                    <SelectItem value="AGGRESSIVE">Agressivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status KYC</Label>
                            <Select onValueChange={(v) => setValue("kycStatus", v as any)} defaultValue="PENDING">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="docs" className="mt-4">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                        <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Nenhum documento anexado.</p>
                        <Button type="button" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Documento
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="mt-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Solicitações de Garantia</h3>
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
