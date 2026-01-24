/**
 * FlowEngine - Motor de Execução de Fluxos
 *
 * Executa fluxos de atendimento baseado no JSON do desenho.
 * Navega pelos nós seguindo as arestas conectadas.
 */

import type {
  Flow,
  FlowNode,
  FlowEdge,
  FlowExecutionContext,
  NodeExecutionResult,
  FlowNodeType,
} from './types';

/**
 * Classe principal do motor de execução
 */
export class FlowEngine {
  private flow: Flow;
  private nodesMap: Map<string, FlowNode>;
  private edgesMap: Map<string, FlowEdge[]>;

  constructor(flow: Flow) {
    this.flow = flow;
    this.nodesMap = new Map();
    this.edgesMap = new Map();

    // Indexar nós e arestas para acesso rápido
    for (const node of flow.nodes) {
      this.nodesMap.set(node.id, node);
    }

    for (const edge of flow.edges) {
      const edges = this.edgesMap.get(edge.source) || [];
      edges.push(edge);
      this.edgesMap.set(edge.source, edges);
    }
  }

  /**
   * Encontra o nó inicial do fluxo
   */
  getStartNode(): FlowNode | null {
    return this.flow.nodes.find((n) => n.type === 'start') || null;
  }

  /**
   * Obtém um nó pelo ID
   */
  getNode(nodeId: string): FlowNode | null {
    return this.nodesMap.get(nodeId) || null;
  }

  /**
   * Obtém as arestas de saída de um nó
   */
  getOutgoingEdges(nodeId: string): FlowEdge[] {
    return this.edgesMap.get(nodeId) || [];
  }

  /**
   * Encontra o próximo nó baseado no handle de saída
   */
  getNextNode(currentNodeId: string, sourceHandle?: string): FlowNode | null {
    const edges = this.getOutgoingEdges(currentNodeId);

    if (edges.length === 0) {
      return null;
    }

    // Se há um handle específico, filtrar por ele
    if (sourceHandle) {
      const edge = edges.find((e) => e.sourceHandle === sourceHandle);
      if (edge) {
        return this.getNode(edge.target);
      }
    }

    // Caso contrário, pegar a primeira aresta
    const edge = edges[0];
    return edge ? this.getNode(edge.target) : null;
  }

  /**
   * Executa um passo do fluxo
   */
  async executeStep(
    nodeId: string,
    context: FlowExecutionContext,
    userInput?: string
  ): Promise<NodeExecutionResult> {
    const node = this.getNode(nodeId);

    if (!node) {
      return {
        success: false,
        error: `Nó não encontrado: ${nodeId}`,
      };
    }

    const data = node.data as Record<string, unknown>;

    // Executar baseado no tipo do nó
    switch (node.type as FlowNodeType) {
      case 'start':
        return this.executeStartNode(node, context);

      case 'message':
        return this.executeMessageNode(node, context);

      case 'input':
        return this.executeInputNode(node, context, userInput);

      case 'menu':
        return this.executeMenuNode(node, context, userInput);

      case 'condition':
        return this.executeConditionNode(node, context);

      case 'ai_agent':
        return this.executeAIAgentNode(node, context, userInput);

      case 'handoff':
        return this.executeHandoffNode(node, context);

      case 'webhook':
        return this.executeWebhookNode(node, context);

      case 'delay':
        return this.executeDelayNode(node, context);

      case 'tag':
        return this.executeTagNode(node, context);

      case 'variable':
        return this.executeVariableNode(node, context);

      case 'identify_contract':
        return this.executeIdentifyContractNode(node, context, userInput);

      case 'client_tag':
        return this.executeClientTagNode(node, context);

      case 'welcome_ai':
        return this.executeWelcomeAINode(node, context, userInput);

      case 'lead_capture':
        return this.executeLeadCaptureNode(node, context, userInput);

      case 'end':
        return this.executeEndNode(node, context);

      default:
        return {
          success: false,
          error: `Tipo de nó desconhecido: ${node.type}`,
        };
    }
  }

  /**
   * Substitui variáveis em uma string
   */
  private replaceVariables(text: string, context: FlowExecutionContext): string {
    return text.replace(/\{(\w+)\}/g, (_, varName) => {
      const value = context.variables[varName];
      return value !== undefined ? String(value) : `{${varName}}`;
    });
  }

  // ==================== EXECUTORES DE NÓS ====================

  private async executeStartNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const nextNode = this.getNextNode(node.id);

    return {
      success: true,
      nextNodeId: nextNode?.id,
    };
  }

  private async executeMessageNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const message = this.replaceVariables((data.message as string) || '', context);
    const nextNode = this.getNextNode(node.id);

    return {
      success: true,
      output: message,
      nextNodeId: nextNode?.id,
    };
  }

  private async executeInputNode(
    node: FlowNode,
    context: FlowExecutionContext,
    userInput?: string
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const question = this.replaceVariables((data.question as string) || '', context);
    const variableName = (data.variableName as string) || 'input';
    const validationType = (data.validationType as string) || 'text';

    // Se não há input do usuário, enviar a pergunta e aguardar
    if (!userInput) {
      return {
        success: true,
        output: question,
        waitForInput: true,
      };
    }

    // Validar input
    const isValid = this.validateInput(userInput, validationType);
    if (!isValid) {
      const errorMessage = (data.errorMessage as string) || 'Entrada inválida. Tente novamente.';
      return {
        success: true,
        output: errorMessage,
        waitForInput: true,
      };
    }

    // Salvar variável e continuar
    const nextNode = this.getNextNode(node.id);

    return {
      success: true,
      nextNodeId: nextNode?.id,
      variables: { [variableName]: userInput },
    };
  }

  private validateInput(input: string, validationType: string): boolean {
    switch (validationType) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'cpf':
        return /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(input.replace(/\D/g, ''));
      case 'phone':
        return /^\d{10,11}$|^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(input.replace(/\D/g, ''));
      case 'number':
        return !isNaN(Number(input));
      case 'date':
        return !isNaN(Date.parse(input));
      default:
        return input.length > 0;
    }
  }

  private async executeMenuNode(
    node: FlowNode,
    context: FlowExecutionContext,
    userInput?: string
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const menuTitle = this.replaceVariables((data.menuTitle as string) || '', context);
    const options = (data.options as { id: string; label: string; value: string }[]) || [];

    // Se não há input, mostrar o menu
    if (!userInput) {
      const menuMessage = [
        menuTitle,
        '',
        ...options.map((opt, idx) => `${idx + 1}. ${opt.label}`),
      ].join('\n');

      return {
        success: true,
        output: menuMessage,
        waitForInput: true,
      };
    }

    // Processar seleção do usuário
    const inputNum = parseInt(userInput, 10);
    const selectedOption =
      inputNum >= 1 && inputNum <= options.length
        ? options[inputNum - 1]
        : options.find(
            (opt) =>
              opt.label.toLowerCase().includes(userInput.toLowerCase()) ||
              opt.value.toLowerCase() === userInput.toLowerCase()
          );

    if (!selectedOption) {
      const invalidMessage =
        (data.invalidMessage as string) || 'Opção inválida. Por favor, selecione uma das opções.';
      return {
        success: true,
        output: invalidMessage,
        waitForInput: true,
      };
    }

    // Navegar para o próximo nó baseado na opção selecionada
    const nextNode = this.getNextNode(node.id, selectedOption.id);

    return {
      success: true,
      nextNodeId: nextNode?.id,
      variables: { menu_selection: selectedOption.value },
    };
  }

  private async executeConditionNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const conditions =
      (data.conditions as { variable: string; operator: string; value: string }[]) || [];

    // Avaliar condições
    let result = true;
    for (const condition of conditions) {
      const varValue = context.variables[condition.variable];
      const conditionResult = this.evaluateCondition(
        varValue,
        condition.operator,
        condition.value
      );
      result = result && conditionResult;
    }

    // Navegar para true ou false
    const handleId = result ? 'true' : 'false';
    const nextNode = this.getNextNode(node.id, handleId);

    return {
      success: true,
      nextNodeId: nextNode?.id,
    };
  }

  private evaluateCondition(
    value: unknown,
    operator: string,
    compareValue: string
  ): boolean {
    const strValue = String(value || '');

    switch (operator) {
      case 'equals':
        return strValue === compareValue;
      case 'not_equals':
        return strValue !== compareValue;
      case 'contains':
        return strValue.toLowerCase().includes(compareValue.toLowerCase());
      case 'starts_with':
        return strValue.toLowerCase().startsWith(compareValue.toLowerCase());
      case 'ends_with':
        return strValue.toLowerCase().endsWith(compareValue.toLowerCase());
      case 'greater_than':
        return Number(value) > Number(compareValue);
      case 'less_than':
        return Number(value) < Number(compareValue);
      case 'is_empty':
        return !strValue || strValue.trim() === '';
      case 'is_not_empty':
        return !!strValue && strValue.trim() !== '';
      case 'matches_regex':
        try {
          return new RegExp(compareValue).test(strValue);
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  private async executeAIAgentNode(
    node: FlowNode,
    context: FlowExecutionContext,
    userInput?: string
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const systemPrompt = (data.systemPrompt as string) || '';
    const model = (data.model as string) || 'gpt-4-turbo';
    const tools = (data.tools as string[]) || [];

    // Simular chamada à API de IA
    // Em produção, isso chamaria a API real (OpenAI, Claude, etc.)
    const aiResponse = await this.simulateAICall(
      systemPrompt,
      userInput || '',
      context,
      tools
    );

    const nextNode = this.getNextNode(node.id);

    return {
      success: true,
      output: aiResponse,
      nextNodeId: nextNode?.id,
      variables: { ai_response: aiResponse },
    };
  }

  private async simulateAICall(
    systemPrompt: string,
    userMessage: string,
    context: FlowExecutionContext,
    tools: string[]
  ): Promise<string> {
    // Simulação - em produção, chamaria a API real
    console.log('[FlowEngine] AI Call:', { systemPrompt, userMessage, tools });

    // Simular resposta baseada em palavras-chave
    const message = userMessage.toLowerCase();

    if (message.includes('boleto') || message.includes('2ª via')) {
      return 'Claro! Vou gerar a segunda via do seu boleto. Um momento...';
    }
    if (message.includes('pagamento') || message.includes('pago')) {
      return 'Vou verificar o status do seu pagamento. Aguarde...';
    }
    if (message.includes('vistoria')) {
      return 'Entendi! Vou verificar as datas disponíveis para agendar sua vistoria.';
    }

    return 'Entendi sua solicitação. Vou processar isso para você.';
  }

  private async executeHandoffNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const transferMessage = this.replaceVariables(
      (data.transferMessage as string) || 'Transferindo para um atendente...',
      context
    );
    const targetId = (data.targetId as string) || '';
    const priority = (data.priority as string) || 'normal';

    // Em produção, isso criaria um ticket na fila de atendimento humano
    console.log('[FlowEngine] Handoff:', { targetId, priority });

    return {
      success: true,
      output: transferMessage,
      // Handoff não tem próximo nó - encerra o fluxo do bot
      variables: {
        handoff_target: targetId,
        handoff_priority: priority,
      },
    };
  }

  private async executeWebhookNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const url = this.replaceVariables((data.url as string) || '', context);
    const method = (data.method as string) || 'GET';
    const body = this.replaceVariables((data.body as string) || '', context);
    const responseVariable = (data.responseVariable as string) || 'webhook_response';

    try {
      // Simular chamada de API
      // Em produção, isso faria uma chamada HTTP real
      console.log('[FlowEngine] Webhook:', { url, method, body });

      const response = { success: true, data: { status: 'ok' } };
      const nextNode = this.getNextNode(node.id);

      return {
        success: true,
        nextNodeId: nextNode?.id,
        variables: { [responseVariable]: JSON.stringify(response) },
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao chamar webhook: ${error}`,
      };
    }
  }

  private async executeDelayNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const delaySeconds = (data.delaySeconds as number) || 5;

    // Aguardar o delay
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));

    const nextNode = this.getNextNode(node.id);

    return {
      success: true,
      nextNodeId: nextNode?.id,
    };
  }

  private async executeTagNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const tagName = (data.tagName as string) || '';
    const action = (data.action as string) || 'add';

    // Em produção, isso atualizaria as tags do contato no CRM
    console.log('[FlowEngine] Tag:', { tagName, action });

    const nextNode = this.getNextNode(node.id);

    return {
      success: true,
      nextNodeId: nextNode?.id,
      variables: { [`tag_${tagName}`]: action === 'add' || action === 'toggle' },
    };
  }

  private async executeVariableNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const variableName = (data.variableName as string) || 'var';
    const valueType = (data.valueType as string) || 'static';
    let value = (data.value as string) || '';

    // Processar valor baseado no tipo
    switch (valueType) {
      case 'expression':
        // Avaliar expressão simples
        try {
          value = this.replaceVariables(value, context);
        } catch {
          // Manter valor original em caso de erro
        }
        break;
      case 'from_variable':
        const sourceVar = (data.sourceVariable as string) || '';
        value = String(context.variables[sourceVar] || '');
        break;
      default:
        value = this.replaceVariables(value, context);
    }

    const nextNode = this.getNextNode(node.id);

    return {
      success: true,
      nextNodeId: nextNode?.id,
      variables: { [variableName]: value },
    };
  }

  private async executeIdentifyContractNode(
    node: FlowNode,
    context: FlowExecutionContext,
    userInput?: string
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const identifyBy = (data.identifyBy as string) || 'cpf';
    const lockContract = (data.lockContract as boolean) || false;
    const askForSelection = (data.askForSelection as boolean) || false;
    const notFoundMessage =
      (data.notFoundMessage as string) ||
      'Não encontrei nenhum contrato vinculado a este dado.';

    // Simular busca de contratos
    // Em produção, isso consultaria o banco de dados
    const contracts = await this.simulateContractSearch(
      identifyBy,
      context.contactPhone || context.variables[identifyBy] as string
    );

    if (contracts.length === 0) {
      const nextNode = this.getNextNode(node.id, 'not_found');
      return {
        success: true,
        output: notFoundMessage,
        nextNodeId: nextNode?.id,
      };
    }

    if (contracts.length > 1 && askForSelection) {
      const selectionMessage =
        (data.selectionMessage as string) ||
        'Encontrei mais de um contrato. Digite o número para selecionar:';
      const contractList = contracts
        .map((c, i) => `${i + 1}. ${c.address} - ${c.status}`)
        .join('\n');

      return {
        success: true,
        output: `${selectionMessage}\n\n${contractList}`,
        waitForInput: true,
        variables: { pending_contracts: contracts },
      };
    }

    // Usar o primeiro contrato
    const contract = contracts[0];
    const nextNode = this.getNextNode(node.id, 'found');

    return {
      success: true,
      nextNodeId: nextNode?.id,
      variables: {
        contract_id: contract.id,
        contract_address: contract.address,
        contract_status: contract.status,
        contract_locked: lockContract,
      },
    };
  }

  private async simulateContractSearch(
    identifyBy: string,
    value: string
  ): Promise<{ id: string; address: string; status: string }[]> {
    // Simulação - em produção, consultaria o banco
    console.log('[FlowEngine] Contract Search:', { identifyBy, value });

    // Retornar contratos simulados
    return [
      {
        id: 'contract-123',
        address: 'Rua das Flores, 123 - Apto 45',
        status: 'Ativo',
      },
    ];
  }

  private async executeClientTagNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const clientTagType = (data.clientTagType as string) || 'novo';
    const customTag = (data.customTag as string) || '';
    const action = (data.action as string) || 'add';
    const autoDetectFromContract = (data.autoDetectFromContract as boolean) || false;
    const contractField = (data.contractField as string) || 'tipo_cliente';

    let tagValue = clientTagType;

    // Se autoDetect está ativado, buscar do contrato
    if (autoDetectFromContract || clientTagType === 'from_contract') {
      // Buscar o tipo do cliente do contrato identificado anteriormente
      const contractType = context.variables[`contract_${contractField}`] as string;
      if (contractType) {
        tagValue = contractType;
      } else {
        // Simular busca do tipo do cliente baseado no contrato
        tagValue = await this.getClientTypeFromContract(context);
      }
    } else if (clientTagType === 'custom') {
      tagValue = customTag;
    }

    // Em produção, isso atualizaria o tipo de cliente no CRM
    console.log('[FlowEngine] Client Tag:', { tagValue, action, autoDetectFromContract });

    const nextNode = this.getNextNode(node.id);

    return {
      success: true,
      nextNodeId: nextNode?.id,
      variables: { client_type: tagValue },
    };
  }

  private async getClientTypeFromContract(
    context: FlowExecutionContext
  ): Promise<string> {
    // Simular busca do tipo de cliente do contrato
    // Em produção, isso consultaria o banco de dados
    const contractId = context.variables.contract_id as string;
    if (!contractId) {
      return 'novo';
    }

    // Simulação de tipos baseado em regras de negócio
    console.log('[FlowEngine] Getting client type from contract:', contractId);

    // Aqui você implementaria a lógica real de busca
    // Por exemplo: verificar se é proprietário, inquilino, garantidor, etc.
    return 'proprietario'; // Valor simulado
  }

  private async executeWelcomeAINode(
    node: FlowNode,
    context: FlowExecutionContext,
    userInput?: string
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const greetingMessage = this.replaceVariables(
      (data.greetingMessage as string) || 'Olá! Como posso ajudar?',
      context
    );
    const model = (data.model as string) || 'gpt-4-turbo';
    const capabilities = (data.capabilities as Record<string, boolean>) || {};
    const enableSmartRouting = (data.enableSmartRouting as boolean) || false;
    const sectorAIs = (data.sectorAIs as { id: string; name: string; keywords: string[] }[]) || [];
    const humanHandoffTriggers = (data.humanHandoffTriggers as string[]) || [];
    const humanHandoffMessage = (data.humanHandoffMessage as string) || 'Transferindo para um atendente...';
    const humanHandoffDepartment = (data.humanHandoffDepartment as string) || '';
    const systemPrompt = (data.systemPrompt as string) || '';

    // Se não há input do usuário, enviar mensagem de boas-vindas
    if (!userInput) {
      return {
        success: true,
        output: greetingMessage,
        waitForInput: true,
      };
    }

    // Detectar tipo de mídia do input
    const mediaType = this.detectMediaType(userInput);

    // Processar baseado no tipo de mídia
    let processedInput = userInput;
    let extractedData: Record<string, unknown> = {};

    if (mediaType === 'audio' && capabilities.handleAudio) {
      // Transcrever áudio
      const transcription = await this.transcribeAudio(userInput, data.audioTranscriptionProvider as string);
      processedInput = transcription;
      extractedData.audio_transcription = transcription;
      console.log('[FlowEngine] Audio transcribed:', transcription);
    } else if (mediaType === 'payment_proof' && capabilities.handlePaymentProof) {
      // Processar comprovante de pagamento via OCR
      const paymentData = await this.processPaymentProof(
        userInput,
        data.ocrProvider as string,
        (data.paymentProofFields as string[]) || ['valor', 'data', 'banco']
      );
      extractedData = { ...extractedData, ...paymentData };
      processedInput = `Comprovante de pagamento recebido: ${JSON.stringify(paymentData)}`;
      console.log('[FlowEngine] Payment proof processed:', paymentData);
    } else if (mediaType === 'image' && capabilities.handleImages) {
      // Processar imagem
      const imageDescription = await this.processImage(userInput);
      extractedData.image_description = imageDescription;
      processedInput = `Imagem recebida: ${imageDescription}`;
    } else if (mediaType === 'document' && capabilities.handleDocuments) {
      // Processar documento
      const documentContent = await this.processDocument(userInput);
      extractedData.document_content = documentContent;
      processedInput = `Documento recebido: ${documentContent}`;
    }

    // Verificar se deve transferir para humano
    if (enableSmartRouting) {
      const shouldTransferToHuman = humanHandoffTriggers.some(
        trigger => processedInput.toLowerCase().includes(trigger.toLowerCase())
      );

      if (shouldTransferToHuman) {
        return {
          success: true,
          output: humanHandoffMessage,
          nextNodeId: undefined,
          variables: {
            ...extractedData,
            handoff_target: humanHandoffDepartment,
            handoff_reason: 'user_request',
          },
        };
      }

      // Verificar se deve transferir para IA de setor
      for (const sectorAI of sectorAIs) {
        const matchesKeyword = sectorAI.keywords?.some(
          keyword => processedInput.toLowerCase().includes(keyword.toLowerCase())
        );
        if (matchesKeyword) {
          const nextNode = this.getNextNode(node.id, 'sector_ai');
          return {
            success: true,
            output: `Entendi! Vou transferir para ${sectorAI.name}.`,
            nextNodeId: nextNode?.id,
            variables: {
              ...extractedData,
              sector_ai_id: sectorAI.id,
              sector_ai_name: sectorAI.name,
              original_message: processedInput,
            },
          };
        }
      }
    }

    // Processar com IA
    const aiResponse = await this.processWithWelcomeAI(
      processedInput,
      systemPrompt,
      model,
      context
    );

    const nextNode = this.getNextNode(node.id, 'continue');

    return {
      success: true,
      output: aiResponse,
      nextNodeId: nextNode?.id,
      variables: {
        ...extractedData,
        welcome_ai_response: aiResponse,
        original_message: processedInput,
        media_type: mediaType,
      },
    };
  }

  private detectMediaType(input: string): 'text' | 'audio' | 'image' | 'payment_proof' | 'document' {
    // Simulação - em produção, verificaria o tipo de mídia real
    if (input.includes('[AUDIO]') || input.endsWith('.ogg') || input.endsWith('.mp3')) {
      return 'audio';
    }
    if (input.includes('[COMPROVANTE]') || input.includes('comprovante') || input.includes('pix')) {
      return 'payment_proof';
    }
    if (input.includes('[IMAGE]') || input.endsWith('.jpg') || input.endsWith('.png')) {
      return 'image';
    }
    if (input.includes('[DOCUMENT]') || input.endsWith('.pdf')) {
      return 'document';
    }
    return 'text';
  }

  private async transcribeAudio(
    audioUrl: string,
    provider: string
  ): Promise<string> {
    // Simulação - em produção, chamaria API de transcrição
    console.log('[FlowEngine] Transcribing audio with:', provider);
    return 'Transcrição do áudio: Olá, gostaria de saber sobre meu boleto.';
  }

  private async processPaymentProof(
    imageUrl: string,
    ocrProvider: string,
    fieldsToExtract: string[]
  ): Promise<Record<string, string>> {
    // Simulação - em produção, chamaria API de OCR
    console.log('[FlowEngine] Processing payment proof with:', ocrProvider, fieldsToExtract);
    return {
      valor: 'R$ 1.500,00',
      data: '10/01/2026',
      banco: 'Banco do Brasil',
      beneficiario: 'Imobiliária XYZ',
      status: 'confirmado',
    };
  }

  private async processImage(imageUrl: string): Promise<string> {
    // Simulação - em produção, chamaria API de visão
    console.log('[FlowEngine] Processing image:', imageUrl);
    return 'Imagem de documento ou comprovante';
  }

  private async processDocument(documentUrl: string): Promise<string> {
    // Simulação - em produção, extrairia texto do documento
    console.log('[FlowEngine] Processing document:', documentUrl);
    return 'Conteúdo do documento extraído';
  }

  private async processWithWelcomeAI(
    userMessage: string,
    systemPrompt: string,
    model: string,
    context: FlowExecutionContext
  ): Promise<string> {
    // Simulação - em produção, chamaria API de IA
    console.log('[FlowEngine] Welcome AI processing:', { model, userMessage });

    // Simular resposta inteligente baseada em palavras-chave
    const message = userMessage.toLowerCase();

    if (message.includes('boleto') || message.includes('2ª via') || message.includes('segunda via')) {
      return 'Entendi! Você precisa de uma segunda via do boleto. Vou verificar seu contrato e gerar uma nova via para você.';
    }
    if (message.includes('pagamento') || message.includes('pago') || message.includes('comprovante')) {
      return 'Recebi seu comprovante de pagamento! Vou verificar e dar baixa no sistema. Aguarde um momento.';
    }
    if (message.includes('vistoria') || message.includes('agendar')) {
      return 'Vou verificar as datas disponíveis para agendar sua vistoria. Qual período seria melhor para você?';
    }
    if (message.includes('problema') || message.includes('reclamação') || message.includes('reclamar')) {
      return 'Sinto muito pelo inconveniente. Vou registrar sua reclamação e encaminhar para o setor responsável.';
    }

    return 'Entendi sua mensagem! Como posso ajudá-lo hoje?';
  }

  private async executeLeadCaptureNode(
    node: FlowNode,
    context: FlowExecutionContext,
    userInput?: string
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const captureFields = (data.captureFields as Record<string, { enabled: boolean; required: boolean; question: string }>) || {};
    const captureOrder = (data.captureOrder as string[]) || ['nome', 'cpf', 'email', 'celular'];
    const saveToDatabase = (data.saveToDatabase as boolean) || false;
    const databaseTable = (data.databaseTable as string) || 'leads';
    const sendToWebhook = (data.sendToWebhook as boolean) || false;
    const webhookUrl = (data.webhookUrl as string) || '';
    const autoTags = (data.autoTags as string[]) || [];
    const leadSource = (data.leadSource as string) || 'whatsapp';
    const introMessage = this.replaceVariables((data.introMessage as string) || '', context);
    const successMessage = this.replaceVariables((data.successMessage as string) || 'Dados registrados com sucesso!', context);
    const errorMessage = (data.errorMessage as string) || 'Erro ao salvar dados.';
    const validateDuplicates = (data.validateDuplicates as boolean) || false;
    const duplicateField = (data.duplicateField as string) || 'cpf';
    const duplicateMessage = (data.duplicateMessage as string) || 'Você já está cadastrado!';

    // Obter campos habilitados em ordem
    const enabledFields = captureOrder.filter(
      field => captureFields[field]?.enabled
    );

    // Verificar estado atual da captura
    const capturedData = (context.variables.lead_capture_data as Record<string, string>) || {};
    const currentFieldIndex = (context.variables.lead_capture_index as number) || 0;

    // Se não há input e é a primeira vez, enviar intro + primeira pergunta
    if (!userInput && currentFieldIndex === 0) {
      const firstField = enabledFields[0];
      if (!firstField) {
        return {
          success: false,
          error: 'Nenhum campo habilitado para captura',
        };
      }

      const question = captureFields[firstField]?.question || `Qual é o seu ${firstField}?`;
      const output = introMessage ? `${introMessage}\n\n${question}` : question;

      return {
        success: true,
        output,
        waitForInput: true,
        variables: {
          lead_capture_index: 0,
          lead_capture_data: {},
          lead_capture_field: firstField,
        },
      };
    }

    // Processar input do usuário
    if (userInput) {
      const currentField = enabledFields[currentFieldIndex];
      if (!currentField) {
        return {
          success: false,
          error: 'Campo de captura não encontrado',
        };
      }

      // Validar input
      const isValid = this.validateLeadInput(userInput, currentField);
      if (!isValid) {
        const fieldConfig = captureFields[currentField];
        return {
          success: true,
          output: `Entrada inválida para ${currentField}. ${fieldConfig?.question || 'Tente novamente.'}`,
          waitForInput: true,
        };
      }

      // Salvar valor capturado
      capturedData[currentField] = userInput;

      // Verificar se há mais campos
      const nextFieldIndex = currentFieldIndex + 1;
      if (nextFieldIndex < enabledFields.length) {
        const nextField = enabledFields[nextFieldIndex];
        const nextQuestion = captureFields[nextField]?.question || `Qual é o seu ${nextField}?`;

        return {
          success: true,
          output: nextQuestion,
          waitForInput: true,
          variables: {
            lead_capture_index: nextFieldIndex,
            lead_capture_data: capturedData,
            lead_capture_field: nextField,
          },
        };
      }

      // Todos os campos foram capturados - validar duplicados se necessário
      if (validateDuplicates) {
        const isDuplicate = await this.checkDuplicateLead(
          capturedData[duplicateField],
          duplicateField,
          databaseTable
        );
        if (isDuplicate) {
          const nextNode = this.getNextNode(node.id, 'duplicate');
          return {
            success: true,
            output: duplicateMessage,
            nextNodeId: nextNode?.id,
            variables: {
              lead_data: capturedData,
              lead_is_duplicate: true,
            },
          };
        }
      }

      // Salvar lead
      try {
        if (saveToDatabase) {
          await this.saveLeadToDatabase(capturedData, databaseTable, leadSource, autoTags);
        }
        if (sendToWebhook && webhookUrl) {
          await this.sendLeadToWebhook(capturedData, webhookUrl, leadSource, autoTags);
        }

        const nextNode = this.getNextNode(node.id, 'success');
        return {
          success: true,
          output: successMessage,
          nextNodeId: nextNode?.id,
          variables: {
            lead_data: capturedData,
            lead_nome: capturedData.nome,
            lead_cpf: capturedData.cpf,
            lead_email: capturedData.email,
            lead_celular: capturedData.celular,
            lead_saved: true,
          },
        };
      } catch (error) {
        const nextNode = this.getNextNode(node.id, 'error');
        return {
          success: true,
          output: errorMessage,
          nextNodeId: nextNode?.id,
          variables: {
            lead_data: capturedData,
            lead_error: String(error),
          },
        };
      }
    }

    return {
      success: false,
      error: 'Estado inválido na captura de lead',
    };
  }

  private validateLeadInput(input: string, field: string): boolean {
    switch (field) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'cpf':
        const cpfClean = input.replace(/\D/g, '');
        return cpfClean.length === 11;
      case 'celular':
        const phoneClean = input.replace(/\D/g, '');
        return phoneClean.length >= 10 && phoneClean.length <= 11;
      case 'nome':
        return input.trim().length >= 2 && input.includes(' ');
      default:
        return input.trim().length > 0;
    }
  }

  private async checkDuplicateLead(
    value: string,
    field: string,
    table: string
  ): Promise<boolean> {
    // Simulação - em produção, consultaria o banco de dados
    console.log('[FlowEngine] Checking duplicate lead:', { value, field, table });
    return false; // Simular que não é duplicado
  }

  private async saveLeadToDatabase(
    leadData: Record<string, string>,
    table: string,
    source: string,
    tags: string[]
  ): Promise<void> {
    // Simulação - em produção, salvaria no banco de dados
    console.log('[FlowEngine] Saving lead to database:', {
      table,
      data: leadData,
      source,
      tags,
      createdAt: new Date().toISOString(),
    });
  }

  private async sendLeadToWebhook(
    leadData: Record<string, string>,
    webhookUrl: string,
    source: string,
    tags: string[]
  ): Promise<void> {
    // Simulação - em produção, faria chamada HTTP
    console.log('[FlowEngine] Sending lead to webhook:', {
      url: webhookUrl,
      data: {
        ...leadData,
        source,
        tags,
        createdAt: new Date().toISOString(),
      },
    });
  }

  private async executeEndNode(
    node: FlowNode,
    context: FlowExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as Record<string, unknown>;
    const endType = (data.endType as string) || 'complete';
    const finalMessage = this.replaceVariables(
      (data.finalMessage as string) || '',
      context
    );
    const markAsResolved = (data.markAsResolved as boolean) || false;

    // Em produção, isso finalizaria o ticket/conversa
    console.log('[FlowEngine] End:', { endType, markAsResolved });

    return {
      success: true,
      output: finalMessage || undefined,
      // Não há próximo nó - fim do fluxo
      variables: {
        flow_ended: true,
        flow_end_type: endType,
        flow_resolved: markAsResolved,
      },
    };
  }
}

/**
 * Função helper para executar um fluxo completo
 */
export async function runFlow(
  flow: Flow,
  initialContext: Partial<FlowExecutionContext>
): Promise<{
  messages: string[];
  variables: Record<string, unknown>;
  finalState: 'completed' | 'waiting_input' | 'handoff' | 'error';
}> {
  const engine = new FlowEngine(flow);
  const messages: string[] = [];
  let variables: Record<string, unknown> = { ...initialContext.variables };

  const context: FlowExecutionContext = {
    sessionId: initialContext.sessionId || `session-${Date.now()}`,
    contactId: initialContext.contactId || 'unknown',
    contactPhone: initialContext.contactPhone,
    contactName: initialContext.contactName,
    variables,
    currentNodeId: '',
    history: [],
    startedAt: new Date(),
    lastActivityAt: new Date(),
  };

  const startNode = engine.getStartNode();
  if (!startNode) {
    return {
      messages: ['Erro: Fluxo não possui nó inicial'],
      variables,
      finalState: 'error',
    };
  }

  let currentNodeId: string | undefined = startNode.id;
  let iterations = 0;
  const maxIterations = 100; // Prevenir loops infinitos

  while (currentNodeId && iterations < maxIterations) {
    iterations++;
    context.currentNodeId = currentNodeId;
    context.lastActivityAt = new Date();

    const result = await engine.executeStep(currentNodeId, context);

    if (!result.success) {
      return {
        messages: [...messages, result.error || 'Erro desconhecido'],
        variables,
        finalState: 'error',
      };
    }

    // Coletar output
    if (result.output) {
      if (Array.isArray(result.output)) {
        messages.push(...result.output);
      } else {
        messages.push(result.output);
      }
    }

    // Atualizar variáveis
    if (result.variables) {
      variables = { ...variables, ...result.variables };
      context.variables = variables;
    }

    // Registrar histórico
    context.history.push({
      nodeId: currentNodeId,
      timestamp: new Date(),
      action: 'executed',
    });

    // Verificar se deve aguardar input
    if (result.waitForInput) {
      return {
        messages,
        variables,
        finalState: 'waiting_input',
      };
    }

    // Verificar se é handoff
    if (variables.handoff_target) {
      return {
        messages,
        variables,
        finalState: 'handoff',
      };
    }

    // Verificar se fluxo terminou
    if (variables.flow_ended) {
      return {
        messages,
        variables,
        finalState: 'completed',
      };
    }

    // Próximo nó
    currentNodeId = result.nextNodeId;
  }

  return {
    messages,
    variables,
    finalState: 'completed',
  };
}
