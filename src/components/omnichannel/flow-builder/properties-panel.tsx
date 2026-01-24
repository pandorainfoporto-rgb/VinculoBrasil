/**
 * PropertiesPanel - Painel de propriedades do nó selecionado
 */

import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFlowBuilderStore } from './store';
import type { FlowNodeType } from './types';

const nodeTypeLabels: Record<FlowNodeType, string> = {
  start: 'Início',
  message: 'Mensagem',
  input: 'Entrada',
  menu: 'Menu',
  condition: 'Condição',
  ai_agent: 'Agente IA',
  welcome_ai: 'IA Boas-Vindas',
  handoff: 'Transferir',
  webhook: 'Webhook',
  delay: 'Aguardar',
  tag: 'Tag',
  variable: 'Variável',
  identify_contract: 'Identificar Contrato',
  client_tag: 'Tag Cliente',
  lead_capture: 'Capturar Lead',
  end: 'Fim',
};

export function PropertiesPanel() {
  const { nodes, selectedNodeId, selectNode, updateNodeData, deleteNode } =
    useFlowBuilderStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return null;
  }

  const nodeType = selectedNode.type as FlowNodeType;
  const data = selectedNode.data as Record<string, unknown>;

  const handleUpdateData = (key: string, value: unknown) => {
    updateNodeData(selectedNode.id, { [key]: value } as Record<string, unknown>);
  };

  const handleDelete = () => {
    deleteNode(selectedNode.id);
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-800">Propriedades</h3>
          <Badge variant="outline" className="mt-1 text-xs">
            {nodeTypeLabels[nodeType] || nodeType}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectNode(null)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Nome do nó - comum a todos */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">Nome</Label>
            <Input
              value={(data.label as string) || ''}
              onChange={(e) => handleUpdateData('label', e.target.value)}
              placeholder="Nome do nó"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Descrição
            </Label>
            <Input
              value={(data.description as string) || ''}
              onChange={(e) => handleUpdateData('description', e.target.value)}
              placeholder="Descrição opcional"
            />
          </div>

          <Separator />

          {/* Propriedades específicas por tipo */}
          {nodeType === 'start' && (
            <StartNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'message' && (
            <MessageNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'input' && (
            <InputNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'menu' && (
            <MenuNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'condition' && (
            <ConditionNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'ai_agent' && (
            <AIAgentNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'handoff' && (
            <HandoffNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'webhook' && (
            <WebhookNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'delay' && (
            <DelayNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'tag' && (
            <TagNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'variable' && (
            <VariableNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'identify_contract' && (
            <IdentifyContractNodeProperties
              data={data}
              onUpdate={handleUpdateData}
            />
          )}

          {nodeType === 'client_tag' && (
            <ClientTagNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'welcome_ai' && (
            <WelcomeAINodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'lead_capture' && (
            <LeadCaptureNodeProperties data={data} onUpdate={handleUpdateData} />
          )}

          {nodeType === 'end' && (
            <EndNodeProperties data={data} onUpdate={handleUpdateData} />
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Nó
        </Button>
      </div>
    </div>
  );
}

// Propriedades específicas por tipo de nó
interface NodePropertiesProps {
  data: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}

function StartNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Tipo de Gatilho
        </Label>
        <Select
          value={(data.triggerType as string) || 'new_conversation'}
          onValueChange={(v) => onUpdate('triggerType', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_conversation">Nova Conversa</SelectItem>
            <SelectItem value="keyword">Palavra-chave</SelectItem>
            <SelectItem value="schedule">Agendamento</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.triggerType === 'keyword' && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">
            Palavras-chave
          </Label>
          <Input
            value={((data.keywords as string[]) || []).join(', ')}
            onChange={(e) =>
              onUpdate(
                'keywords',
                e.target.value.split(',').map((k) => k.trim())
              )
            }
            placeholder="oi, olá, começar"
          />
          <p className="text-xs text-slate-400">Separe por vírgulas</p>
        </div>
      )}
    </div>
  );
}

function MessageNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Mensagem</Label>
        <Textarea
          value={(data.message as string) || ''}
          onChange={(e) => onUpdate('message', e.target.value)}
          placeholder="Digite a mensagem..."
          rows={4}
        />
        <p className="text-xs text-slate-400">
          Use {'{variavel}'} para inserir variáveis
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Tipo de Mídia
        </Label>
        <Select
          value={(data.mediaType as string) || 'none'}
          onValueChange={(v) => onUpdate('mediaType', v === 'none' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem mídia</SelectItem>
            <SelectItem value="image">Imagem</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="audio">Áudio</SelectItem>
            <SelectItem value="document">Documento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {typeof data.mediaType === 'string' && data.mediaType !== 'none' && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">URL da Mídia</Label>
          <Input
            value={(data.mediaUrl as string) || ''}
            onChange={(e) => onUpdate('mediaUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
}

function InputNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Pergunta</Label>
        <Textarea
          value={(data.question as string) || ''}
          onChange={(e) => onUpdate('question', e.target.value)}
          placeholder="Digite a pergunta..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Salvar resposta em
        </Label>
        <Input
          value={(data.variableName as string) || ''}
          onChange={(e) => onUpdate('variableName', e.target.value)}
          placeholder="nome_variavel"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Tipo de Validação
        </Label>
        <Select
          value={(data.validationType as string) || 'text'}
          onValueChange={(v) => onUpdate('validationType', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="number">Número</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="cpf">CPF</SelectItem>
            <SelectItem value="phone">Telefone</SelectItem>
            <SelectItem value="date">Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Mensagem de Erro
        </Label>
        <Input
          value={(data.errorMessage as string) || ''}
          onChange={(e) => onUpdate('errorMessage', e.target.value)}
          placeholder="Formato inválido. Tente novamente."
        />
      </div>
    </div>
  );
}

function MenuNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  const options = (data.options as { id: string; label: string; value: string }[]) || [];

  const addOption = () => {
    const newOption = {
      id: `opt-${Date.now()}`,
      label: 'Nova opção',
      value: `option_${options.length + 1}`,
    };
    onUpdate('options', [...options, newOption]);
  };

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onUpdate('options', newOptions);
  };

  const removeOption = (index: number) => {
    onUpdate('options', options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Título do Menu
        </Label>
        <Input
          value={(data.menuTitle as string) || ''}
          onChange={(e) => onUpdate('menuTitle', e.target.value)}
          placeholder="Selecione uma opção:"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-slate-600">Opções</Label>
          <Button variant="outline" size="sm" onClick={addOption}>
            + Adicionar
          </Button>
        </div>

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={opt.id} className="flex gap-2">
              <Input
                value={opt.label}
                onChange={(e) => updateOption(idx, 'label', e.target.value)}
                placeholder="Rótulo"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOption(idx)}
                className="text-red-500 h-9 w-9 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConditionNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  const conditions = (data.conditions as { id: string; variable: string; operator: string; value: string }[]) || [];

  const addCondition = () => {
    const newCondition = {
      id: `cond-${Date.now()}`,
      variable: '',
      operator: 'equals',
      value: '',
    };
    onUpdate('conditions', [...conditions, newCondition]);
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    onUpdate('conditions', newConditions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-slate-600">Condições</Label>
        <Button variant="outline" size="sm" onClick={addCondition}>
          + Adicionar
        </Button>
      </div>

      {conditions.map((cond, idx) => (
        <div key={cond.id} className="space-y-2 p-2 bg-slate-50 rounded-lg">
          <Input
            value={cond.variable}
            onChange={(e) => updateCondition(idx, 'variable', e.target.value)}
            placeholder="Variável"
          />
          <Select
            value={cond.operator}
            onValueChange={(v) => updateCondition(idx, 'operator', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Igual a</SelectItem>
              <SelectItem value="not_equals">Diferente de</SelectItem>
              <SelectItem value="contains">Contém</SelectItem>
              <SelectItem value="starts_with">Começa com</SelectItem>
              <SelectItem value="ends_with">Termina com</SelectItem>
              <SelectItem value="greater_than">Maior que</SelectItem>
              <SelectItem value="less_than">Menor que</SelectItem>
              <SelectItem value="is_empty">Está vazio</SelectItem>
              <SelectItem value="is_not_empty">Não está vazio</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={cond.value}
            onChange={(e) => updateCondition(idx, 'value', e.target.value)}
            placeholder="Valor"
          />
        </div>
      ))}
    </div>
  );
}

function AIAgentNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  const tools = (data.tools as string[]) || [];
  const availableTools = [
    'consultar_status_contrato',
    'gerar_segunda_via_boleto',
    'verificar_pagamento',
    'agendar_vistoria',
    'transferir_para_humano',
    'buscar_imoveis',
    'calcular_garantia',
  ];

  const toggleTool = (tool: string) => {
    if (tools.includes(tool)) {
      onUpdate('tools', tools.filter((t) => t !== tool));
    } else {
      onUpdate('tools', [...tools, tool]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Prompt do Sistema
        </Label>
        <Textarea
          value={(data.systemPrompt as string) || ''}
          onChange={(e) => onUpdate('systemPrompt', e.target.value)}
          placeholder="Você é um assistente de atendimento..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Modelo</Label>
        <Select
          value={(data.model as string) || 'gpt-4-turbo'}
          onValueChange={(v) => onUpdate('model', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Ferramentas (Tools)
        </Label>
        <div className="space-y-2">
          {availableTools.map((tool) => (
            <div key={tool} className="flex items-center gap-2">
              <Switch
                checked={tools.includes(tool)}
                onCheckedChange={() => toggleTool(tool)}
              />
              <span className="text-xs text-slate-600">
                {tool.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HandoffNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Tipo de Transferência
        </Label>
        <Select
          value={(data.transferType as string) || 'department'}
          onValueChange={(v) => onUpdate('transferType', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="department">Departamento</SelectItem>
            <SelectItem value="queue">Fila</SelectItem>
            <SelectItem value="agent">Agente Específico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Destino</Label>
        <Select
          value={(data.targetId as string) || ''}
          onValueChange={(v) => onUpdate('targetId', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dept-financeiro">Financeiro</SelectItem>
            <SelectItem value="dept-suporte">Suporte</SelectItem>
            <SelectItem value="dept-comercial">Comercial</SelectItem>
            <SelectItem value="dept-juridico">Jurídico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Mensagem de Transferência
        </Label>
        <Textarea
          value={(data.transferMessage as string) || ''}
          onChange={(e) => onUpdate('transferMessage', e.target.value)}
          placeholder="Aguarde, estou transferindo..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Prioridade</Label>
        <Select
          value={(data.priority as string) || 'normal'}
          onValueChange={(v) => onUpdate('priority', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function WebhookNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">URL</Label>
        <Input
          value={(data.url as string) || ''}
          onChange={(e) => onUpdate('url', e.target.value)}
          placeholder="https://api.exemplo.com/endpoint"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Método</Label>
        <Select
          value={(data.method as string) || 'GET'}
          onValueChange={(v) => onUpdate('method', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Body (JSON)
        </Label>
        <Textarea
          value={(data.body as string) || ''}
          onChange={(e) => onUpdate('body', e.target.value)}
          placeholder='{"key": "value"}'
          rows={4}
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Salvar resposta em
        </Label>
        <Input
          value={(data.responseVariable as string) || ''}
          onChange={(e) => onUpdate('responseVariable', e.target.value)}
          placeholder="resposta_api"
        />
      </div>
    </div>
  );
}

function DelayNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Tempo de espera (segundos)
        </Label>
        <Input
          type="number"
          min={1}
          max={300}
          value={(data.delaySeconds as number) || 5}
          onChange={(e) => onUpdate('delaySeconds', parseInt(e.target.value) || 5)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium text-slate-600">
            Mostrar "digitando..."
          </Label>
          <p className="text-xs text-slate-400">
            Simula digitação durante o delay
          </p>
        </div>
        <Switch
          checked={(data.showTyping as boolean) || false}
          onCheckedChange={(v) => onUpdate('showTyping', v)}
        />
      </div>
    </div>
  );
}

function TagNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Nome da Tag</Label>
        <Input
          value={(data.tagName as string) || ''}
          onChange={(e) => onUpdate('tagName', e.target.value)}
          placeholder="vip, prioridade, etc."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Ação</Label>
        <Select
          value={(data.action as string) || 'add'}
          onValueChange={(v) => onUpdate('action', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Adicionar</SelectItem>
            <SelectItem value="remove">Remover</SelectItem>
            <SelectItem value="toggle">Alternar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function VariableNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Nome da Variável
        </Label>
        <Input
          value={(data.variableName as string) || ''}
          onChange={(e) => onUpdate('variableName', e.target.value)}
          placeholder="minha_variavel"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Tipo de Valor
        </Label>
        <Select
          value={(data.valueType as string) || 'static'}
          onValueChange={(v) => onUpdate('valueType', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">Valor Estático</SelectItem>
            <SelectItem value="expression">Expressão</SelectItem>
            <SelectItem value="from_variable">De Outra Variável</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Valor</Label>
        <Input
          value={(data.value as string) || ''}
          onChange={(e) => onUpdate('value', e.target.value)}
          placeholder="valor"
        />
      </div>
    </div>
  );
}

function IdentifyContractNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Identificar Por
        </Label>
        <Select
          value={(data.identifyBy as string) || 'cpf'}
          onValueChange={(v) => onUpdate('identifyBy', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpf">CPF</SelectItem>
            <SelectItem value="phone">Telefone</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium text-slate-600">
            Travar Contrato
          </Label>
          <p className="text-xs text-slate-400">Vincula ao atendimento</p>
        </div>
        <Switch
          checked={(data.lockContract as boolean) || false}
          onCheckedChange={(v) => onUpdate('lockContract', v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium text-slate-600">
            Permitir Seleção
          </Label>
          <p className="text-xs text-slate-400">Se múltiplos contratos</p>
        </div>
        <Switch
          checked={(data.askForSelection as boolean) || false}
          onCheckedChange={(v) => onUpdate('askForSelection', v)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Mensagem - Não Encontrado
        </Label>
        <Textarea
          value={(data.notFoundMessage as string) || ''}
          onChange={(e) => onUpdate('notFoundMessage', e.target.value)}
          placeholder="Não encontrei contrato vinculado..."
          rows={2}
        />
      </div>
    </div>
  );
}

function ClientTagNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Detecção automática do cadastro */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium text-slate-600">
            Tipo Automático do Cadastro
          </Label>
          <p className="text-xs text-slate-400">
            Detecta o tipo do contrato/cliente
          </p>
        </div>
        <Switch
          checked={(data.autoDetectFromContract as boolean) || false}
          onCheckedChange={(v) => onUpdate('autoDetectFromContract', v)}
        />
      </div>

      {Boolean(data.autoDetectFromContract) && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">
            Selecionar Campo do Cadastro
          </Label>
          <Select
            value={(data.contractField as string) || 'tipo_cliente'}
            onValueChange={(v) => onUpdate('contractField', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tipo_cliente">Tipo de Cliente</SelectItem>
              <SelectItem value="perfil">Perfil</SelectItem>
              <SelectItem value="categoria">Categoria</SelectItem>
              <SelectItem value="segmento">Segmento</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">
            O tipo será preenchido automaticamente com base neste campo
          </p>
        </div>
      )}

      {!Boolean(data.autoDetectFromContract) && (
        <>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Tipo de Cliente
            </Label>
            <Select
              value={(data.clientTagType as string) || 'novo'}
              onValueChange={(v) => onUpdate('clientTagType', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo Cliente</SelectItem>
                <SelectItem value="recorrente">Cliente Recorrente</SelectItem>
                <SelectItem value="vip">Cliente VIP</SelectItem>
                <SelectItem value="inadimplente">Inadimplente</SelectItem>
                <SelectItem value="investidor">Investidor</SelectItem>
                <SelectItem value="garantidor">Garantidor</SelectItem>
                <SelectItem value="imobiliaria">Imobiliária</SelectItem>
                <SelectItem value="proprietario">Proprietário</SelectItem>
                <SelectItem value="inquilino">Inquilino</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="from_contract">Do Cadastro (Auto)</SelectItem>
                <SelectItem value="custom">Tag Customizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.clientTagType === 'custom' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Tag Customizada
              </Label>
              <Input
                value={(data.customTag as string) || ''}
                onChange={(e) => onUpdate('customTag', e.target.value)}
                placeholder="Nome da tag"
              />
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Ação</Label>
        <Select
          value={(data.action as string) || 'add'}
          onValueChange={(v) => onUpdate('action', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Adicionar Tag</SelectItem>
            <SelectItem value="remove">Remover Tag</SelectItem>
            <SelectItem value="set">Definir como Única</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface WelcomeAICapabilities {
  handleAudio?: boolean;
  handleText?: boolean;
  handlePaymentProof?: boolean;
  handleImages?: boolean;
  handleDocuments?: boolean;
}

function WelcomeAINodeProperties({ data, onUpdate }: NodePropertiesProps) {
  const capabilitiesRaw: WelcomeAICapabilities = (data.capabilities as WelcomeAICapabilities) || {};
  const handleAudio = capabilitiesRaw.handleAudio === true;
  const handleText = capabilitiesRaw.handleText === true;
  const handlePaymentProof = capabilitiesRaw.handlePaymentProof === true;
  const handleImages = capabilitiesRaw.handleImages === true;
  const handleDocuments = capabilitiesRaw.handleDocuments === true;

  const sectorAIs = (data.sectorAIs as { id: string; name: string; description: string; keywords: string[] }[]) || [];

  const updateCapability = (key: string, value: boolean) => {
    onUpdate('capabilities', { ...capabilitiesRaw, [key]: value });
  };

  const addSectorAI = () => {
    const newAI = {
      id: `ai-${Date.now()}`,
      name: 'Nova IA de Setor',
      description: '',
      keywords: [],
    };
    onUpdate('sectorAIs', [...sectorAIs, newAI]);
  };

  const updateSectorAI = (index: number, field: string, value: unknown) => {
    const updated = [...sectorAIs];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate('sectorAIs', updated);
  };

  const removeSectorAI = (index: number) => {
    onUpdate('sectorAIs', sectorAIs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Mensagem de boas-vindas */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Mensagem de Boas-Vindas
        </Label>
        <Textarea
          value={(data.greetingMessage as string) || ''}
          onChange={(e) => onUpdate('greetingMessage', e.target.value)}
          placeholder="Olá! Sou a IA de atendimento. Como posso ajudar?"
          rows={3}
        />
      </div>

      {/* Modelo */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Modelo IA</Label>
        <Select
          value={(data.model as string) || 'gpt-4-turbo'}
          onValueChange={(v) => onUpdate('model', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Capacidades Multimodais */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-slate-600">
          Capacidades Multimodais
        </Label>
        <p className="text-xs text-slate-400">
          O que a IA consegue interpretar na primeira interação
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎤</span>
              <span className="text-xs text-slate-600">Áudio (transcrever e responder)</span>
            </div>
            <Switch
              checked={handleAudio}
              onCheckedChange={(v) => updateCapability('handleAudio', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">💬</span>
              <span className="text-xs text-slate-600">Texto (ler e responder)</span>
            </div>
            <Switch
              checked={handleText}
              onCheckedChange={(v) => updateCapability('handleText', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🧾</span>
              <span className="text-xs text-slate-600">Comprovante de pagamento</span>
            </div>
            <Switch
              checked={handlePaymentProof}
              onCheckedChange={(v) => updateCapability('handlePaymentProof', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🖼️</span>
              <span className="text-xs text-slate-600">Imagens gerais</span>
            </div>
            <Switch
              checked={handleImages}
              onCheckedChange={(v) => updateCapability('handleImages', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">📄</span>
              <span className="text-xs text-slate-600">Documentos (PDF, etc)</span>
            </div>
            <Switch
              checked={handleDocuments}
              onCheckedChange={(v) => updateCapability('handleDocuments', v)}
            />
          </div>
        </div>
      </div>

      {/* Configurações de Áudio */}
      {capabilitiesRaw.handleAudio === true ? (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Transcrição de Áudio
            </Label>
            <Select
              value={(data.audioTranscriptionProvider as string) || 'whisper'}
              onValueChange={(v) => onUpdate('audioTranscriptionProvider', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whisper">OpenAI Whisper</SelectItem>
                <SelectItem value="azure">Azure Speech</SelectItem>
                <SelectItem value="google">Google Speech-to-Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Responder em
            </Label>
            <Select
              value={(data.audioResponseType as string) || 'text'}
              onValueChange={(v) => onUpdate('audioResponseType', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="audio">Áudio</SelectItem>
                <SelectItem value="both">Texto e Áudio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      {/* Configurações de Comprovante */}
      {handlePaymentProof ? (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              OCR para Comprovantes
            </Label>
            <Select
              value={(data.ocrProvider as string) || 'google_vision'}
              onValueChange={(v) => onUpdate('ocrProvider', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_vision">Google Vision</SelectItem>
                <SelectItem value="azure">Azure Computer Vision</SelectItem>
                <SelectItem value="tesseract">Tesseract OCR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Campos a Extrair
            </Label>
            <Input
              value={((data.paymentProofFields as string[]) || ['valor', 'data', 'banco']).join(', ')}
              onChange={(e) =>
                onUpdate('paymentProofFields', e.target.value.split(',').map((f) => f.trim()))
              }
              placeholder="valor, data, banco, beneficiario"
            />
            <p className="text-xs text-slate-400">Separe por vírgulas</p>
          </div>
        </>
      ) : null}

      <Separator />

      {/* Roteamento Inteligente */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium text-slate-600">
            Roteamento Inteligente
          </Label>
          <p className="text-xs text-slate-400">
            Transferir para IAs de setor ou humano
          </p>
        </div>
        <Switch
          checked={(data.enableSmartRouting as boolean) || false}
          onCheckedChange={(v) => onUpdate('enableSmartRouting', v)}
        />
      </div>

      {Boolean(data.enableSmartRouting) && (
        <>
          {/* IAs de Setor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-600">
                IAs de Setor Disponíveis
              </Label>
              <Button variant="outline" size="sm" onClick={addSectorAI}>
                + Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {sectorAIs.map((ai, idx) => (
                <div key={ai.id} className="p-2 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={ai.name}
                      onChange={(e) => updateSectorAI(idx, 'name', e.target.value)}
                      placeholder="Nome da IA"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSectorAI(idx)}
                      className="text-red-500 h-9 w-9 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={ai.description}
                    onChange={(e) => updateSectorAI(idx, 'description', e.target.value)}
                    placeholder="Descrição (ex: Atende dúvidas financeiras)"
                  />
                  <Input
                    value={(ai.keywords || []).join(', ')}
                    onChange={(e) =>
                      updateSectorAI(idx, 'keywords', e.target.value.split(',').map((k) => k.trim()))
                    }
                    placeholder="Palavras-chave: boleto, pagamento, 2ª via"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Transferência para Humano */}
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Gatilhos para Transferir para Humano
            </Label>
            <Input
              value={((data.humanHandoffTriggers as string[]) || []).join(', ')}
              onChange={(e) =>
                onUpdate('humanHandoffTriggers', e.target.value.split(',').map((t) => t.trim()))
              }
              placeholder="atendente, humano, falar com pessoa"
            />
            <p className="text-xs text-slate-400">
              Palavras/frases que acionam transferência automática
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Mensagem ao Transferir
            </Label>
            <Input
              value={(data.humanHandoffMessage as string) || ''}
              onChange={(e) => onUpdate('humanHandoffMessage', e.target.value)}
              placeholder="Entendi! Vou transferir para um atendente..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Departamento Destino
            </Label>
            <Select
              value={(data.humanHandoffDepartment as string) || ''}
              onValueChange={(v) => onUpdate('humanHandoffDepartment', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dept-financeiro">Financeiro</SelectItem>
                <SelectItem value="dept-suporte">Suporte</SelectItem>
                <SelectItem value="dept-comercial">Comercial</SelectItem>
                <SelectItem value="dept-juridico">Jurídico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Separator />

      {/* Prompt do Sistema */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Prompt do Sistema (Instruções)
        </Label>
        <Textarea
          value={(data.systemPrompt as string) || ''}
          onChange={(e) => onUpdate('systemPrompt', e.target.value)}
          placeholder="Você é uma IA de boas-vindas. Sua função é..."
          rows={5}
        />
      </div>
    </div>
  );
}

function LeadCaptureNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  const captureFields = (data.captureFields as Record<string, { enabled: boolean; required: boolean; question: string }>) || {
    nome: { enabled: true, required: true, question: 'Qual é o seu nome completo?' },
    cpf: { enabled: true, required: true, question: 'Qual é o seu CPF?' },
    email: { enabled: true, required: true, question: 'Qual é o seu e-mail?' },
    celular: { enabled: true, required: true, question: 'Qual é o seu celular (com DDD)?' },
    empresa: { enabled: false, required: false, question: 'Qual é o nome da sua empresa?' },
    cargo: { enabled: false, required: false, question: 'Qual é o seu cargo?' },
    interesse: { enabled: false, required: false, question: 'Qual é o seu interesse?' },
    origem: { enabled: false, required: false, question: 'Como nos conheceu?' },
  };

  const fieldLabels: Record<string, string> = {
    nome: 'Nome',
    cpf: 'CPF',
    email: 'E-mail',
    celular: 'Celular',
    empresa: 'Empresa',
    cargo: 'Cargo',
    interesse: 'Interesse',
    origem: 'Origem',
  };

  const updateField = (field: string, key: string, value: unknown) => {
    const updated = { ...captureFields };
    updated[field] = { ...updated[field], [key]: value };
    onUpdate('captureFields', updated);
  };

  return (
    <div className="space-y-4">
      {/* Mensagem de introdução */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Mensagem de Introdução
        </Label>
        <Textarea
          value={(data.introMessage as string) || ''}
          onChange={(e) => onUpdate('introMessage', e.target.value)}
          placeholder="Para melhor atendê-lo, preciso de algumas informações..."
          rows={2}
        />
      </div>

      <Separator />

      {/* Campos a Capturar */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-slate-600">
          Campos a Capturar (Lead)
        </Label>

        {Object.entries(fieldLabels).map(([field, label]) => {
          const fieldConfig = captureFields[field] || { enabled: false, required: false, question: '' };
          return (
            <div key={field} className="p-2 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={fieldConfig.enabled || false}
                    onCheckedChange={(v) => updateField(field, 'enabled', v)}
                  />
                  <span className="text-xs font-medium text-slate-700">{label}</span>
                </div>
                {fieldConfig.enabled && (
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={fieldConfig.required || false}
                      onChange={(e) => updateField(field, 'required', e.target.checked)}
                      className="h-3 w-3"
                    />
                    <span className="text-[10px] text-slate-500">Obrigatório</span>
                  </div>
                )}
              </div>
              {fieldConfig.enabled && (
                <Input
                  value={fieldConfig.question || ''}
                  onChange={(e) => updateField(field, 'question', e.target.value)}
                  placeholder={`Pergunta para capturar ${label.toLowerCase()}`}
                  className="text-xs"
                />
              )}
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Persistência */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-slate-600">
          Salvar Dados
        </Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-600">Salvar no Banco de Dados</span>
            <p className="text-[10px] text-slate-400">Tabela de leads</p>
          </div>
          <Switch
            checked={(data.saveToDatabase as boolean) || false}
            onCheckedChange={(v) => onUpdate('saveToDatabase', v)}
          />
        </div>

        {Boolean(data.saveToDatabase) && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Nome da Tabela
            </Label>
            <Input
              value={(data.databaseTable as string) || 'leads'}
              onChange={(e) => onUpdate('databaseTable', e.target.value)}
              placeholder="leads"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-600">Enviar para Webhook</span>
            <p className="text-[10px] text-slate-400">CRM externo, etc.</p>
          </div>
          <Switch
            checked={(data.sendToWebhook as boolean) || false}
            onCheckedChange={(v) => onUpdate('sendToWebhook', v)}
          />
        </div>

        {Boolean(data.sendToWebhook) && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              URL do Webhook
            </Label>
            <Input
              value={(data.webhookUrl as string) || ''}
              onChange={(e) => onUpdate('webhookUrl', e.target.value)}
              placeholder="https://api.crm.com/leads"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Origem e Tags */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Origem do Lead
        </Label>
        <Input
          value={(data.leadSource as string) || ''}
          onChange={(e) => onUpdate('leadSource', e.target.value)}
          placeholder="WhatsApp, Site, Campanha X"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Tags Automáticas
        </Label>
        <Input
          value={((data.autoTags as string[]) || []).join(', ')}
          onChange={(e) =>
            onUpdate('autoTags', e.target.value.split(',').map((t) => t.trim()))
          }
          placeholder="lead, prospecto, whatsapp"
        />
        <p className="text-xs text-slate-400">Separe por vírgulas</p>
      </div>

      <Separator />

      {/* Validação de duplicados */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium text-slate-600">
            Validar Duplicados
          </Label>
          <p className="text-[10px] text-slate-400">
            Verificar se lead já existe
          </p>
        </div>
        <Switch
          checked={(data.validateDuplicates as boolean) || false}
          onCheckedChange={(v) => onUpdate('validateDuplicates', v)}
        />
      </div>

      {Boolean(data.validateDuplicates) && (
        <>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Campo para Verificação
            </Label>
            <Select
              value={(data.duplicateField as string) || 'cpf'}
              onValueChange={(v) => onUpdate('duplicateField', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="celular">Celular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Mensagem se Duplicado
            </Label>
            <Input
              value={(data.duplicateMessage as string) || ''}
              onChange={(e) => onUpdate('duplicateMessage', e.target.value)}
              placeholder="Você já está cadastrado em nossa base!"
            />
          </div>
        </>
      )}

      <Separator />

      {/* Mensagens finais */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Mensagem de Sucesso
        </Label>
        <Textarea
          value={(data.successMessage as string) || ''}
          onChange={(e) => onUpdate('successMessage', e.target.value)}
          placeholder="Obrigado! Seus dados foram registrados com sucesso."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Mensagem de Erro
        </Label>
        <Input
          value={(data.errorMessage as string) || ''}
          onChange={(e) => onUpdate('errorMessage', e.target.value)}
          placeholder="Ocorreu um erro ao salvar seus dados."
        />
      </div>
    </div>
  );
}

function EndNodeProperties({ data, onUpdate }: NodePropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Tipo de Encerramento
        </Label>
        <Select
          value={(data.endType as string) || 'complete'}
          onValueChange={(v) => onUpdate('endType', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complete">Concluído</SelectItem>
            <SelectItem value="cancel">Cancelado</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">
          Mensagem Final
        </Label>
        <Textarea
          value={(data.finalMessage as string) || ''}
          onChange={(e) => onUpdate('finalMessage', e.target.value)}
          placeholder="Obrigado pelo contato!"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium text-slate-600">
            Marcar como Resolvido
          </Label>
          <p className="text-xs text-slate-400">Fecha o ticket automaticamente</p>
        </div>
        <Switch
          checked={(data.markAsResolved as boolean) || false}
          onCheckedChange={(v) => onUpdate('markAsResolved', v)}
        />
      </div>
    </div>
  );
}
