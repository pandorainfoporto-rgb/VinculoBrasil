
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, FileText, Save } from "lucide-react";
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

import { tenantService, type Tenant } from "../../../../../services/tenantService";

const formSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(11, "CPF inválido"),
    phone: z.string().optional(),
    monthlyIncome: z.string().optional(),
    creditScore: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["ACTIVE", "PENDING", "BLOCKED", "EVICTED"]).optional(),
});

type TenantFormData = z.infer<typeof formSchema>;

interface TenantFormProps {
    tenant: Tenant | null | undefined;
    isEditing: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function TenantForm({ tenant, isEditing, onClose, onSuccess }: TenantFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset
    } = useForm<TenantFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            cpf: "",
            phone: "",
            monthlyIncome: "",
            creditScore: "",
            notes: "",
            status: "PENDING",
        },
    });

    useEffect(() => {
        if (tenant) {
            reset({
                name: tenant.user.name,
                email: tenant.user.email,
                cpf: tenant.user.cpf,
                phone: tenant.user.phone,
                monthlyIncome: tenant.monthlyIncome || "",
                creditScore: tenant.creditScore?.toString() || "",
                notes: tenant.notes,
                status: tenant.status,
            });
        } else {
            reset({
                status: "PENDING"
            });
        }
    }, [tenant, reset]);

    const onSubmit = async (values: TenantFormData) => {
        try {
            const payload = {
                ...values,
                monthlyIncome: values.monthlyIncome ? Number(values.monthlyIncome) : undefined,
                creditScore: values.creditScore ? Number(values.creditScore) : undefined,
            };

            if (isEditing && tenant) {
                await tenantService.updateTenant(tenant.id, payload);
                toast.success("Inquilino atualizado com sucesso!");
            } else {
                await tenantService.createTenant(payload as any);
                toast.success("Inquilino criado com sucesso!");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar inquilino.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                    <TabsTrigger value="docs">Documentos</TabsTrigger>
                    <TabsTrigger value="contracts">Contratos</TabsTrigger>
                    <TabsTrigger value="tickets">Chamados</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome Completo*</Label>
                            <Input {...register("name")} placeholder="Nome do inquilino" />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>CPF*</Label>
                            <Input {...register("cpf")} placeholder="000.000.000-00" />
                            {errors.cpf && <span className="text-red-500 text-xs">{errors.cpf.message}</span>}
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

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Renda Mensal</Label>
                            <Input type="number" step="0.01" {...register("monthlyIncome")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Score de Crédito</Label>
                            <Input type="number" {...register("creditScore")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select onValueChange={(v) => setValue("status", v as any)} defaultValue="PENDING">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                                    <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                                    <SelectItem value="EVICTED">Despejado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Observações</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Notas internas..."
                            {...register("notes")}
                        />
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

                <TabsContent value="contracts" className="mt-4">
                    <div className="text-center p-8 text-muted-foreground">
                        Nenhum contrato ativo.
                    </div>
                </TabsContent>

                <TabsContent value="tickets" className="mt-4">
                    {isEditing && tenant ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">Histórico de Chamados</h3>
                                <Button type="button" size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Novo Chamado</Button>
                            </div>
                            <div className="border rounded-md p-4 bg-muted/50 text-center">
                                Sem chamados recentes.
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 text-muted-foreground">
                            Salve o inquilino para gerenciar chamados.
                        </div>
                    )}
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
