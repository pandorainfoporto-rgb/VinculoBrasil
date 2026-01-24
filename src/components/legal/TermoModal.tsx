// ============================================
// TERMO DE CESSÃO DE CRÉDITO - Modal Legal
// Obriga o usuário a ler antes de investir
// ============================================

import { useState, useRef } from 'react';
import { ShieldCheck, FileText, X, ScrollText } from 'lucide-react';

interface TermoModalProps {
  assetTitle: string;
  assetPrice: number;
  onAccept: () => void;
  onClose: () => void;
}

export function TermoModal({ assetTitle, assetPrice, onAccept, onClose }: TermoModalProps) {
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Detecta se o usuário rolou até o fim do documento
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 20;
    if (bottom && !canAccept) {
      setCanAccept(true);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-700">

        {/* CABEÇALHO */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Termo de Cessão de Crédito Digital
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ativo: <span className="font-semibold text-gray-700 dark:text-gray-300">{assetTitle}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Valor: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(assetPrice)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CORPO DO TEXTO (Scrollável) */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-8 space-y-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50"
        >
          <div className="text-center mb-6">
            <h4 className="text-base font-bold uppercase text-gray-800 dark:text-gray-100">
              Instrumento Particular de Cessão de Direitos Creditórios
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Celebrado via Plataforma Digital Vínculo Brasil
            </p>
          </div>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">1. DAS PARTES</h5>
            <p>
              De um lado, o <strong>CEDENTE</strong> (Proprietário do imóvel, identificado no Smart Contract),
              doravante denominado "Vendedor", e de outro o <strong>CESSIONÁRIO</strong> (Investidor, identificado
              pela Carteira Digital), doravante denominado "Comprador", celebram o presente Termo de Cessão de
              Crédito via Plataforma Vínculo Brasil.
            </p>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">2. DO OBJETO</h5>
            <p>
              O CEDENTE cede e transfere ao CESSIONÁRIO, em caráter <strong>definitivo e irrevogável</strong>,
              a titularidade dos direitos de crédito referentes aos aluguéis do imóvel objeto desta transação,
              representados digitalmente pelo Token NFT (padrão ERC-1155) registrado na blockchain Polygon.
            </p>
            <p className="mt-2">
              Os direitos cedidos correspondem aos valores futuros de aluguel, conforme detalhado no Smart Contract,
              incluindo valores principais e eventuais reajustes contratuais.
            </p>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">3. DO PREÇO E FORMA DE PAGAMENTO</h5>
            <p>
              O CESSIONÁRIO pagará ao CEDENTE o valor de <strong>{formatCurrency(assetPrice)}</strong> via PIX,
              com liquidação instantânea. Após a confirmação do pagamento, a transferência da titularidade do
              Token ocorrerá automaticamente via Smart Contract.
            </p>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
              4. DECLARAÇÃO DE CONHECIMENTO DOS RISCOS
            </h5>
            <p>O CESSIONÁRIO declara estar plenamente ciente de que:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                O retorno financeiro do investimento depende exclusivamente do <strong>pagamento regular do
                aluguel pelo inquilino</strong> locatário do imóvel;
              </li>
              <li>
                Existe <strong>Seguro Fiança</strong> ativo garantindo a operação, sujeito às condições e
                coberturas previstas na respectiva apólice de seguro;
              </li>
              <li>
                A tecnologia Blockchain é utilizada para registro, transparência e automatização da operação,
                mas <strong>não elimina os riscos inerentes ao mercado imobiliário</strong> e de crédito;
              </li>
              <li>
                Em caso de inadimplência não coberta pelo seguro, o CESSIONÁRIO poderá não receber os valores
                esperados, ficando a Plataforma Vínculo Brasil isenta de responsabilidade solidária;
              </li>
              <li>
                Este investimento <strong>não possui garantia do FGC</strong> (Fundo Garantidor de Créditos) e
                não é um título de renda fixa tradicional.
              </li>
            </ul>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">5. DA LIQUIDAÇÃO E TRANSFERÊNCIA</h5>
            <p>
              A transferência da titularidade do Token (NFT) ocorrerá de forma <strong>automática e irrevogável</strong> após:
            </p>
            <ol className="list-decimal pl-6 space-y-1 mt-2">
              <li>Confirmação do pagamento via PIX no gateway de pagamentos (Asaas);</li>
              <li>Liquidação bancária e validação do sistema;</li>
              <li>Execução do Smart Contract na blockchain Polygon.</li>
            </ol>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">6. DA TECNOLOGIA E CUSTÓDIA</h5>
            <p>
              O Token será custodiado em carteira digital gerenciada pela Plataforma Vínculo Brasil (modelo de
              "Invisible Wallet"), garantindo a segurança e simplificando a experiência do usuário. O CESSIONÁRIO
              poderá solicitar a transferência para carteira própria a qualquer momento.
            </p>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">7. DO DIREITO DE REVENDA (LIQUIDEZ)</h5>
            <p>
              O CESSIONÁRIO poderá revender o Token no marketplace P2P da Plataforma Vínculo Brasil a qualquer
              momento, sujeito à disponibilidade de compradores e às condições de mercado. A Plataforma não
              garante liquidez imediata.
            </p>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">8. DA TRIBUTAÇÃO</h5>
            <p>
              O CESSIONÁRIO é responsável pelo recolhimento de tributos incidentes sobre os rendimentos auferidos,
              conforme legislação vigente. A Plataforma Vínculo Brasil fornecerá os informes necessários para
              declaração de imposto de renda.
            </p>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">9. DA ASSINATURA DIGITAL</h5>
            <p>
              A aceitação deste Termo, mediante clique no botão "Li e Aceito os Termos", constitui assinatura
              digital válida e vinculante, nos termos da MP 2.200-2/2001 (ICP-Brasil) e Lei 14.063/2020.
            </p>
            <p className="mt-2">
              O registro do IP, data/hora e identificação do usuário autenticado servem como prova da manifestação
              de vontade.
            </p>
          </section>

          <section>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-2">10. DO FORO</h5>
            <p>
              As partes elegem o foro da Comarca de <strong>São Paulo/SP</strong> para dirimir quaisquer dúvidas
              ou litígios decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          <div className="pt-8 pb-4 text-center border-t border-gray-200 dark:border-gray-700 mt-8">
            <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 mb-2">
              <ScrollText className="w-4 h-4" />
              <span className="text-xs italic">— Fim do Documento —</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Documento gerado automaticamente em {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* RODAPÉ (Ações) */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
          <div className="flex flex-col gap-4">
            {/* Aviso de segurança */}
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                Este documento será assinado digitalmente via Login Seguro. Seu IP, data e hora serão
                registrados para validade jurídica.
              </span>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>

              <button
                onClick={onAccept}
                disabled={!canAccept}
                className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  canAccept
                    ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 cursor-pointer shadow-blue-500/30'
                    : 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-70'
                }`}
                title={canAccept ? 'Aceitar e continuar' : 'Role até o final para habilitar'}
              >
                {canAccept ? (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Li e Aceito os Termos
                  </>
                ) : (
                  <>
                    <ScrollText className="w-5 h-5" />
                    Role para ler tudo...
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
