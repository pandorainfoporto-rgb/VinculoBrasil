/**
 * Vinculo.io - Clipboard Utility
 *
 * Helper seguro para copiar texto para a area de transferencia.
 * Usa fallback para ambientes onde Clipboard API esta bloqueada.
 */

/**
 * Copia texto para a area de transferencia de forma segura.
 * Usa Clipboard API quando disponivel, com fallback para execCommand.
 *
 * @param text - Texto a ser copiado
 * @returns Promise<boolean> - true se copiou com sucesso, false se falhou
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Tenta usar a Clipboard API moderna
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback: usa execCommand
    return copyWithFallback(text);
  } catch {
    // Se falhar, tenta fallback
    return copyWithFallback(text);
  }
}

/**
 * Fallback para copiar usando execCommand (compatibilidade com navegadores antigos)
 */
function copyWithFallback(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    console.warn('Nao foi possivel copiar para a area de transferencia');
    return false;
  }
}
