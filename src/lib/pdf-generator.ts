/**
 * Vinculo.io - Gerador de PDF
 *
 * Utilitario para gerar e baixar PDFs de relatorios, contratos e documentos.
 * Usa a API nativa do navegador para criar PDFs via impressao.
 */

export interface PDFDocument {
  title: string;
  content: string; // HTML content
  filename: string;
  orientation?: 'portrait' | 'landscape';
}

export interface ContractPDFData {
  contractId: string;
  landlordName: string;
  tenantName: string;
  guarantorName?: string;
  propertyAddress: string;
  rentAmount: number;
  startDate: Date;
  endDate: Date;
  paymentDueDay: 10 | 15 | 20;
  setupFee: number;
  nftTokenId?: string;
}

export interface PaymentReceiptData {
  receiptNumber: string;
  payerName: string;
  amount: number;
  paymentDate: Date;
  dueDate: Date;
  description: string;
  transactionHash?: string;
}

/**
 * Formata moeda em BRL
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data em pt-BR
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * CSS base para documentos PDF
 */
const BASE_PDF_STYLES = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #4f46e5;
    }
    .logo {
      font-size: 24pt;
      font-weight: bold;
      color: #4f46e5;
    }
    .subtitle {
      font-size: 10pt;
      color: #666;
      margin-top: 5px;
    }
    h1 {
      font-size: 18pt;
      color: #1a1a1a;
      margin: 20px 0 10px;
    }
    h2 {
      font-size: 14pt;
      color: #333;
      margin: 15px 0 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    .section {
      margin: 20px 0;
    }
    .field {
      display: flex;
      margin: 8px 0;
    }
    .field-label {
      font-weight: bold;
      width: 180px;
      color: #555;
    }
    .field-value {
      flex: 1;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .table th, .table td {
      padding: 10px;
      text-align: left;
      border: 1px solid #ddd;
    }
    .table th {
      background: #f5f5f5;
      font-weight: bold;
    }
    .amount {
      font-size: 16pt;
      font-weight: bold;
      color: #059669;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #888;
      text-align: center;
    }
    .signature-section {
      margin-top: 60px;
      display: flex;
      justify-content: space-around;
    }
    .signature-box {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 50px;
      padding-top: 5px;
    }
    .highlight {
      background: #fef3c7;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .legal-text {
      font-size: 9pt;
      color: #666;
      text-align: justify;
      margin: 20px 0;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
`;

/**
 * Gera HTML do cabecalho padrao Vinculo.io
 */
function generateHeader(title: string): string {
  return `
    <div class="header">
      <div class="logo">Vinculo Brasil</div>
      <div class="subtitle">Plataforma de Locacao Imobiliaria com Garantia Blockchain</div>
    </div>
    <h1>${title}</h1>
  `;
}

/**
 * Gera HTML do rodape padrao
 */
function generateFooter(): string {
  const now = new Date();
  return `
    <div class="footer">
      <p>Documento gerado automaticamente pela plataforma Vinculo Brasil</p>
      <p>Data de emissao: ${formatDate(now)} as ${now.toLocaleTimeString('pt-BR')}</p>
      <p>Este documento tem validade juridica conforme Lei do Inquilinato (Lei 8.245/91)</p>
      <p>Vinculo Brasil LTDA - CNPJ: 00.000.000/0001-00</p>
    </div>
  `;
}

/**
 * Gera PDF de contrato de locacao
 */
export function generateContractPDF(data: ContractPDFData): string {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Contrato de Locacao - ${data.contractId}</title>
      ${BASE_PDF_STYLES}
    </head>
    <body>
      ${generateHeader('CONTRATO DE LOCACAO RESIDENCIAL')}

      <div class="section">
        <h2>Identificacao do Contrato</h2>
        <div class="field">
          <span class="field-label">Numero do Contrato:</span>
          <span class="field-value">${data.contractId}</span>
        </div>
        ${data.nftTokenId ? `
        <div class="field">
          <span class="field-label">Token NFT (Blockchain):</span>
          <span class="field-value">${data.nftTokenId}</span>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h2>Partes Contratantes</h2>
        <div class="field">
          <span class="field-label">LOCADOR (Proprietario):</span>
          <span class="field-value">${data.landlordName}</span>
        </div>
        <div class="field">
          <span class="field-label">LOCATARIO (Inquilino):</span>
          <span class="field-value">${data.tenantName}</span>
        </div>
        ${data.guarantorName ? `
        <div class="field">
          <span class="field-label">GARANTIDOR:</span>
          <span class="field-value">${data.guarantorName}</span>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h2>Imovel Objeto da Locacao</h2>
        <div class="field">
          <span class="field-label">Endereco Completo:</span>
          <span class="field-value">${data.propertyAddress}</span>
        </div>
      </div>

      <div class="section">
        <h2>Condicoes Financeiras</h2>
        <div class="highlight">
          <div class="field">
            <span class="field-label">Valor do Aluguel:</span>
            <span class="field-value amount">${formatCurrency(data.rentAmount)}</span>
          </div>
          <div class="field">
            <span class="field-label">Data de Vencimento:</span>
            <span class="field-value">Todo dia ${data.paymentDueDay} de cada mes</span>
          </div>
          <div class="field">
            <span class="field-label">Taxa de Setup (3%):</span>
            <span class="field-value">${formatCurrency(data.setupFee)}</span>
          </div>
        </div>

        <table class="table">
          <tr>
            <th>Descricao</th>
            <th>Percentual</th>
            <th>Valor</th>
          </tr>
          <tr>
            <td>Locador (Proprietario)</td>
            <td>85%</td>
            <td>${formatCurrency(data.rentAmount * 0.85)}</td>
          </tr>
          <tr>
            <td>Seguradora</td>
            <td>5%</td>
            <td>${formatCurrency(data.rentAmount * 0.05)}</td>
          </tr>
          <tr>
            <td>Garantidor</td>
            <td>5%</td>
            <td>${formatCurrency(data.rentAmount * 0.05)}</td>
          </tr>
          <tr>
            <td>Plataforma Vinculo</td>
            <td>5%</td>
            <td>${formatCurrency(data.rentAmount * 0.05)}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Vigencia do Contrato</h2>
        <div class="field">
          <span class="field-label">Data de Inicio:</span>
          <span class="field-value">${formatDate(data.startDate)}</span>
        </div>
        <div class="field">
          <span class="field-label">Data de Termino:</span>
          <span class="field-value">${formatDate(data.endDate)}</span>
        </div>
      </div>

      <div class="section">
        <h2>Clausulas Gerais</h2>
        <p class="legal-text">
          1. Este contrato e regido pela Lei do Inquilinato (Lei 8.245/91) e demais legislacoes aplicaveis.
        </p>
        <p class="legal-text">
          2. O pagamento do aluguel devera ser realizado ate o dia ${data.paymentDueDay} de cada mes,
          conforme Art. 23 da Lei 8.245/91, que estabelece que o pagamento deve ser pos-pago,
          ou seja, pago apos o periodo de utilizacao do imovel.
        </p>
        <p class="legal-text">
          3. A taxa de setup no valor de ${formatCurrency(data.setupFee)} (3% do aluguel) sera cobrada
          2 (dois) dias apos a assinatura do contrato, cobrindo os custos de vistoria inicial,
          registro do contrato, mintagem do NFT na blockchain e geracao da garantia.
        </p>
        <p class="legal-text">
          4. O primeiro aluguel sera calculado proporcionalmente aos dias de ocupacao,
          conforme legislacao vigente, sendo devido na primeira data de vencimento (dia ${data.paymentDueDay})
          do mes subsequente ao inicio da locacao.
        </p>
        <p class="legal-text">
          5. Este contrato esta registrado de forma imutavel na blockchain Polygon,
          garantindo transparencia e seguranca juridica para todas as partes.
        </p>
      </div>

      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">LOCADOR</div>
          <p>${data.landlordName}</p>
        </div>
        <div class="signature-box">
          <div class="signature-line">LOCATARIO</div>
          <p>${data.tenantName}</p>
        </div>
        ${data.guarantorName ? `
        <div class="signature-box">
          <div class="signature-line">GARANTIDOR</div>
          <p>${data.guarantorName}</p>
        </div>
        ` : ''}
      </div>

      ${generateFooter()}
    </body>
    </html>
  `;

  return html;
}

/**
 * Gera PDF de recibo de pagamento
 */
export function generatePaymentReceiptPDF(data: PaymentReceiptData): string {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Recibo de Pagamento - ${data.receiptNumber}</title>
      ${BASE_PDF_STYLES}
    </head>
    <body>
      ${generateHeader('RECIBO DE PAGAMENTO')}

      <div class="section">
        <div class="field">
          <span class="field-label">Numero do Recibo:</span>
          <span class="field-value">${data.receiptNumber}</span>
        </div>
        <div class="field">
          <span class="field-label">Data do Pagamento:</span>
          <span class="field-value">${formatDate(data.paymentDate)}</span>
        </div>
      </div>

      <div class="section">
        <h2>Dados do Pagamento</h2>
        <div class="highlight">
          <div class="field">
            <span class="field-label">Valor Pago:</span>
            <span class="field-value amount">${formatCurrency(data.amount)}</span>
          </div>
        </div>
        <div class="field">
          <span class="field-label">Pagador:</span>
          <span class="field-value">${data.payerName}</span>
        </div>
        <div class="field">
          <span class="field-label">Descricao:</span>
          <span class="field-value">${data.description}</span>
        </div>
        <div class="field">
          <span class="field-label">Vencimento Original:</span>
          <span class="field-value">${formatDate(data.dueDate)}</span>
        </div>
        ${data.transactionHash ? `
        <div class="field">
          <span class="field-label">Hash da Transacao:</span>
          <span class="field-value" style="font-family: monospace; font-size: 10pt;">${data.transactionHash}</span>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <p class="legal-text">
          Recebemos a importancia acima especificada e damos plena quitacao do valor pago,
          para nada mais reclamar a qualquer titulo referente ao periodo em questao.
        </p>
      </div>

      ${generateFooter()}
    </body>
    </html>
  `;

  return html;
}

/**
 * Abre janela de impressao/download do PDF
 * Usando iframe oculto para evitar problemas com popup blockers
 */
export function downloadPDF(htmlContent: string, filename: string): void {
  // Metodo 1: Tentar usando iframe oculto (mais confiavel)
  try {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      throw new Error('Nao foi possivel acessar o documento do iframe');
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Aguarda o carregamento e abre dialogo de impressao
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // Se falhar, tenta abrir em nova janela
        openPrintWindow(htmlContent, filename);
      }

      // Remove o iframe apos um tempo
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  } catch {
    // Fallback: tentar abrir nova janela
    openPrintWindow(htmlContent, filename);
  }
}

/**
 * Abre nova janela para impressao (fallback)
 */
function openPrintWindow(htmlContent: string, filename: string): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    console.error('Bloqueador de popups ativo. Baixando como HTML.');
    // Fallback final: criar um blob e baixar
    downloadAsHTML(htmlContent, filename);
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Aguarda o carregamento e abre dialogo de impressao
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Fallback: baixa como arquivo HTML
 */
function downloadAsHTML(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace('.pdf', '.html');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gera e baixa PDF de contrato
 */
export function downloadContractPDF(data: ContractPDFData): void {
  const html = generateContractPDF(data);
  downloadPDF(html, `contrato-${data.contractId}.pdf`);
}

/**
 * Gera e baixa PDF de recibo
 */
export function downloadPaymentReceiptPDF(data: PaymentReceiptData): void {
  const html = generatePaymentReceiptPDF(data);
  downloadPDF(html, `recibo-${data.receiptNumber}.pdf`);
}

// ============================================================================
// RELATORIO DE IMPOSTO DE RENDA
// ============================================================================

export interface TaxReportData {
  landlordName: string;
  landlordCPF: string;
  year: number;
  properties: Array<{
    address: string;
    monthlyRent: number;
    monthlyNet: number; // 85% do aluguel
  }>;
  monthlyData: Array<{
    month: string;
    grossRevenue: number;
    netRevenue: number;
  }>;
  totalGrossRevenue: number;
  totalNetRevenue: number;
}

/**
 * Gera PDF de relatorio para Imposto de Renda
 */
export function generateTaxReportPDF(data: TaxReportData): string {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatorio IR ${data.year} - ${data.landlordName}</title>
      ${BASE_PDF_STYLES}
    </head>
    <body>
      ${generateHeader(`RELATORIO DE RENDIMENTOS - IRPF ${data.year}`)}

      <div class="section">
        <h2>Dados do Contribuinte</h2>
        <div class="field">
          <span class="field-label">Nome Completo:</span>
          <span class="field-value">${data.landlordName}</span>
        </div>
        <div class="field">
          <span class="field-label">CPF:</span>
          <span class="field-value">${data.landlordCPF}</span>
        </div>
        <div class="field">
          <span class="field-label">Ano-Calendario:</span>
          <span class="field-value">${data.year}</span>
        </div>
      </div>

      <div class="section">
        <h2>Imoveis Locados</h2>
        <table class="table">
          <tr>
            <th>Endereco</th>
            <th>Aluguel Mensal</th>
            <th>Receita Liquida (85%)</th>
          </tr>
          ${data.properties.map(prop => `
          <tr>
            <td>${prop.address}</td>
            <td>${formatCurrency(prop.monthlyRent)}</td>
            <td>${formatCurrency(prop.monthlyNet)}</td>
          </tr>
          `).join('')}
        </table>
      </div>

      <div class="section">
        <h2>Demonstrativo Mensal de Receitas</h2>
        <table class="table">
          <tr>
            <th>Mes</th>
            <th>Receita Bruta</th>
            <th>Receita Liquida (85%)</th>
          </tr>
          ${data.monthlyData.map(month => `
          <tr>
            <td>${month.month}</td>
            <td>${formatCurrency(month.grossRevenue)}</td>
            <td>${formatCurrency(month.netRevenue)}</td>
          </tr>
          `).join('')}
          <tr style="font-weight: bold; background: #e5e5e5;">
            <td>TOTAL ANUAL</td>
            <td>${formatCurrency(data.totalGrossRevenue)}</td>
            <td>${formatCurrency(data.totalNetRevenue)}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Resumo para Declaracao IRPF</h2>
        <div class="highlight">
          <div class="field">
            <span class="field-label">Total de Rendimentos Tributaveis:</span>
            <span class="field-value amount">${formatCurrency(data.totalNetRevenue)}</span>
          </div>
          <p style="margin-top: 10px; font-size: 10pt; color: #666;">
            * O valor liquido considera o split 85/5/5/5 onde 15% e destinado a seguradora,
            garantidor e plataforma, nao configurando rendimento do locador.
          </p>
        </div>
      </div>

      <div class="section">
        <p class="legal-text">
          Este relatorio foi gerado automaticamente pela plataforma Vinculo Brasil e contem
          todas as informacoes necessarias para preenchimento da Declaracao de Imposto de
          Renda Pessoa Fisica (DIRPF) referente aos rendimentos de alugueis.
        </p>
        <p class="legal-text">
          Os valores apresentados sao os efetivamente recebidos pelo locador (85% do valor
          do aluguel), conforme split automatico realizado pela plataforma. Os 15% restantes
          sao direcionados a seguradora (5%), garantidor (5%) e plataforma (5%).
        </p>
      </div>

      ${generateFooter()}
    </body>
    </html>
  `;

  return html;
}

/**
 * Gera e baixa PDF de relatorio IR
 */
export function downloadTaxReportPDF(data: TaxReportData): void {
  const html = generateTaxReportPDF(data);
  downloadPDF(html, `relatorio-ir-${data.year}-${data.landlordName.replace(/\s+/g, '-')}.pdf`);
}

// ============================================================================
// RELATORIO DRE
// ============================================================================

export interface DREReportData {
  companyName: string;
  period: string;
  revenue: {
    rentals: number;
    fees: number;
    other: number;
    total: number;
  };
  expenses: {
    operational: number;
    administrative: number;
    marketing: number;
    technology: number;
    total: number;
  };
  netIncome: number;
  margin: number;
}

/**
 * Gera PDF de DRE
 */
export function generateDREReportPDF(data: DREReportData): string {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>DRE - ${data.period}</title>
      ${BASE_PDF_STYLES}
    </head>
    <body>
      ${generateHeader('DEMONSTRATIVO DE RESULTADO DO EXERCICIO (DRE)')}

      <div class="section">
        <div class="field">
          <span class="field-label">Empresa:</span>
          <span class="field-value">${data.companyName}</span>
        </div>
        <div class="field">
          <span class="field-label">Periodo:</span>
          <span class="field-value">${data.period}</span>
        </div>
      </div>

      <div class="section">
        <h2>Receitas</h2>
        <table class="table">
          <tr>
            <td>Receita de Alugueis</td>
            <td style="text-align: right">${formatCurrency(data.revenue.rentals)}</td>
          </tr>
          <tr>
            <td>Taxas de Servico</td>
            <td style="text-align: right">${formatCurrency(data.revenue.fees)}</td>
          </tr>
          <tr>
            <td>Outras Receitas</td>
            <td style="text-align: right">${formatCurrency(data.revenue.other)}</td>
          </tr>
          <tr style="font-weight: bold; background: #e8f5e9;">
            <td>RECEITA BRUTA TOTAL</td>
            <td style="text-align: right">${formatCurrency(data.revenue.total)}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Despesas</h2>
        <table class="table">
          <tr>
            <td>Despesas Operacionais</td>
            <td style="text-align: right">(${formatCurrency(data.expenses.operational)})</td>
          </tr>
          <tr>
            <td>Despesas Administrativas</td>
            <td style="text-align: right">(${formatCurrency(data.expenses.administrative)})</td>
          </tr>
          <tr>
            <td>Marketing e Vendas</td>
            <td style="text-align: right">(${formatCurrency(data.expenses.marketing)})</td>
          </tr>
          <tr>
            <td>Tecnologia e Infraestrutura</td>
            <td style="text-align: right">(${formatCurrency(data.expenses.technology)})</td>
          </tr>
          <tr style="font-weight: bold; background: #ffebee;">
            <td>TOTAL DE DESPESAS</td>
            <td style="text-align: right">(${formatCurrency(data.expenses.total)})</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Resultado</h2>
        <div class="highlight">
          <div class="field">
            <span class="field-label">Lucro Liquido:</span>
            <span class="field-value amount">${formatCurrency(data.netIncome)}</span>
          </div>
          <div class="field">
            <span class="field-label">Margem de Lucro:</span>
            <span class="field-value">${data.margin.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      ${generateFooter()}
    </body>
    </html>
  `;

  return html;
}

/**
 * Gera e baixa PDF de DRE
 */
export function downloadDREReportPDF(data: DREReportData): void {
  const html = generateDREReportPDF(data);
  downloadPDF(html, `dre-${data.period.replace(/\s+/g, '-')}.pdf`);
}
