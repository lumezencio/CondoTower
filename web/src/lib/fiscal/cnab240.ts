/**
 * Geração de arquivo CNAB 240 para pagamento de guias (DARF, GPS, boletos)
 *
 * O CNAB 240 é o padrão bancário FEBRABAN para troca de informações entre
 * empresas e bancos. Permite pagamento em lote de tributos via internet banking.
 *
 * Tipos de pagamento suportados:
 *   - DARF (tipo J): tributos federais (IRRF, CSLL, COFINS, PIS)
 *   - GPS (tipo N): guias previdenciárias (INSS)
 *   - Boleto (tipo J): pagamento de fornecedores
 *
 * Referência: Manual de Leiaute CNAB 240 FEBRABAN v10.8
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type PagamentoDarf = {
  tipo: "DARF";
  codigoReceita: string;
  periodoApuracao: string;     // DDMMAAAA
  cnpjContribuinte: string;
  dataVencimento: Date;
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  numeroReferencia?: string;
};

export type PagamentoGps = {
  tipo: "GPS";
  codigoPagamento: string;     // "2100" (PF), "2631" (PJ cessao mao obra)
  competencia: string;         // MMAAAA
  cnpjContribuinte: string;
  identificadorContribuinte: string;  // NIT/PIS/PASEP
  dataVencimento: Date;
  valorINSS: number;
  valorOutrasEntidades: number;
};

export type PagamentoBoleto = {
  tipo: "BOLETO";
  codigoBarras: string;
  dataVencimento: Date;
  valor: number;
  nomeFornecedor: string;
  cnpjFornecedor: string;
};

export type PagamentoCnab = PagamentoDarf | PagamentoGps | PagamentoBoleto;

export type DadosEmpresa = {
  cnpj: string;
  razaoSocial: string;
  banco: string;             // código do banco (ex: "001" BB, "104" CEF, "341" Itaú)
  agencia: string;
  conta: string;
  digitoConta: string;
};

// ---------------------------------------------------------------------------
// Geração do arquivo CNAB 240
// ---------------------------------------------------------------------------

export function gerarCnab240(
  empresa: DadosEmpresa,
  pagamentos: PagamentoCnab[]
): string {
  const lines: string[] = [];
  const now = new Date();
  const dataGeracao = formatDateCnab(now);
  const horaGeracao = formatTimeCnab(now);
  const nsa = "000001"; // Número sequencial do arquivo

  // ===== HEADER DO ARQUIVO (Registro 0) =====
  lines.push(
    pad(empresa.banco, 3) +              // 01-03 Código do banco
    "0000" +                               // 04-07 Lote de serviço (0000 = header arquivo)
    "0" +                                  // 08 Tipo de registro (0 = header)
    pad("", 9) +                           // 09-17 Uso exclusivo FEBRABAN
    "2" +                                  // 18 Tipo inscrição empresa (2 = CNPJ)
    padNum(empresa.cnpj.replace(/\D/g, ""), 14) + // 19-32 CNPJ
    pad("", 20) +                          // 33-52 Código convênio
    padNum(empresa.agencia, 5) +           // 53-57 Agência
    " " +                                  // 58 Dígito agência
    padNum(empresa.conta, 12) +            // 59-70 Conta
    empresa.digitoConta.charAt(0) +        // 71 Dígito conta
    " " +                                  // 72 Dígito agência/conta
    padRight(empresa.razaoSocial, 30) +    // 73-102 Nome empresa
    padRight("BANCO", 30) +                // 103-132 Nome banco
    pad("", 10) +                          // 133-142 Uso FEBRABAN
    "1" +                                  // 143 Código remessa (1 = remessa)
    dataGeracao +                          // 144-151 Data geração
    horaGeracao +                          // 152-157 Hora geração
    padNum(nsa, 6) +                       // 158-163 NSA
    "089" +                                // 164-166 Versão layout
    padNum("0", 5) +                       // 167-171 Densidade gravação
    pad("", 69)                            // 172-240 Uso reservado
  );

  let loteNum = 1;
  let totalRegistros = 2; // header + trailer arquivo
  let valorTotalArquivo = 0;

  // Agrupar pagamentos por tipo para lotes separados
  const darfs = pagamentos.filter(p => p.tipo === "DARF") as PagamentoDarf[];
  const gpss = pagamentos.filter(p => p.tipo === "GPS") as PagamentoGps[];
  const boletos = pagamentos.filter(p => p.tipo === "BOLETO") as PagamentoBoleto[];

  // ===== LOTE DARF (Tipo serviço: Pagamento de Tributos) =====
  if (darfs.length > 0) {
    const { loteLines, totalValor } = gerarLoteDarf(empresa, darfs, loteNum, dataGeracao);
    lines.push(...loteLines);
    totalRegistros += loteLines.length;
    valorTotalArquivo += totalValor;
    loteNum++;
  }

  // ===== LOTE GPS (Tipo serviço: Pagamento de Tributos) =====
  if (gpss.length > 0) {
    const { loteLines, totalValor } = gerarLoteGps(empresa, gpss, loteNum, dataGeracao);
    lines.push(...loteLines);
    totalRegistros += loteLines.length;
    valorTotalArquivo += totalValor;
    loteNum++;
  }

  // ===== LOTE BOLETOS =====
  if (boletos.length > 0) {
    const { loteLines, totalValor } = gerarLoteBoletos(empresa, boletos, loteNum, dataGeracao);
    lines.push(...loteLines);
    totalRegistros += loteLines.length;
    valorTotalArquivo += totalValor;
    loteNum++;
  }

  // ===== TRAILER DO ARQUIVO (Registro 9) =====
  lines.push(
    pad(empresa.banco, 3) +
    "9999" +
    "9" +
    pad("", 9) +
    padNum(String(loteNum - 1), 6) +       // Quantidade de lotes
    padNum(String(totalRegistros), 6) +    // Quantidade de registros
    pad("", 6) +                           // Qtde contas conciliação
    pad("", 205)
  );

  return lines.map(l => l.substring(0, 240).padEnd(240)).join("\r\n");
}

// ---------------------------------------------------------------------------
// Lote DARF
// ---------------------------------------------------------------------------

function gerarLoteDarf(
  empresa: DadosEmpresa,
  darfs: PagamentoDarf[],
  loteNum: number,
  dataGeracao: string
): { loteLines: string[]; totalValor: number } {
  const lines: string[] = [];
  const lote = padNum(String(loteNum), 4);
  let totalValor = 0;

  // Header do lote
  lines.push(
    pad(empresa.banco, 3) + lote + "1" +
    "C" +                                    // Tipo operação (C = crédito)
    "22" +                                   // Tipo serviço (22 = pgto tributos cod barras)
    "00" +                                   // Forma lançamento
    "042" +                                  // Versão layout lote
    " " +
    "2" + padNum(empresa.cnpj.replace(/\D/g, ""), 14) +
    pad("", 20) +
    padNum(empresa.agencia, 5) + " " +
    padNum(empresa.conta, 12) + empresa.digitoConta.charAt(0) + " " +
    padRight(empresa.razaoSocial, 30) +
    pad("", 40) +                            // Mensagem
    padRight("", 30) +                       // Endereço
    padNum("0", 5) + padRight("", 15) + padRight("", 20) + pad("", 8) +
    pad("", 10)
  );

  // Registros detalhe (segmentos N para DARF)
  darfs.forEach((darf, idx) => {
    const valorTotal = darf.valorPrincipal + darf.valorMulta + darf.valorJuros;
    totalValor += valorTotal;

    // Segmento N (tributos)
    lines.push(
      pad(empresa.banco, 3) + lote + "3" +
      padNum(String(idx + 1), 5) +           // Nº sequencial
      "N" +                                  // Código segmento
      "0" +                                  // Tipo movimento (0 = inclusão)
      "00" +                                 // Código instrução
      padNum(darf.codigoReceita, 4) +
      "2" + padNum(darf.cnpjContribuinte.replace(/\D/g, ""), 14) +
      darf.periodoApuracao.padEnd(8) +
      padRight(darf.numeroReferencia ?? "", 17) +
      padNum(Math.round(darf.valorPrincipal * 100).toString(), 15) +
      padNum(Math.round(darf.valorMulta * 100).toString(), 15) +
      padNum(Math.round(darf.valorJuros * 100).toString(), 15) +
      padNum(Math.round(valorTotal * 100).toString(), 15) +
      formatDateCnab(darf.dataVencimento) +
      dataGeracao +                          // Data pagamento
      pad("", 63)
    );
  });

  // Trailer do lote
  lines.push(
    pad(empresa.banco, 3) + lote + "5" +
    pad("", 9) +
    padNum(String(darfs.length + 2), 6) +    // Qtde registros no lote
    padNum(Math.round(totalValor * 100).toString(), 18) +
    pad("", 171) + pad("", 30) + pad("", 10)
  );

  return { loteLines: lines, totalValor };
}

// ---------------------------------------------------------------------------
// Lote GPS
// ---------------------------------------------------------------------------

function gerarLoteGps(
  empresa: DadosEmpresa,
  gpss: PagamentoGps[],
  loteNum: number,
  dataGeracao: string
): { loteLines: string[]; totalValor: number } {
  const lines: string[] = [];
  const lote = padNum(String(loteNum), 4);
  let totalValor = 0;

  // Header do lote
  lines.push(
    pad(empresa.banco, 3) + lote + "1" +
    "C" + "17" + "00" + "030" + " " +
    "2" + padNum(empresa.cnpj.replace(/\D/g, ""), 14) +
    pad("", 20) +
    padNum(empresa.agencia, 5) + " " +
    padNum(empresa.conta, 12) + empresa.digitoConta.charAt(0) + " " +
    padRight(empresa.razaoSocial, 30) +
    pad("", 40) + padRight("", 30) +
    padNum("0", 5) + padRight("", 15) + padRight("", 20) + pad("", 8) +
    pad("", 10)
  );

  // Registros detalhe (segmento N para GPS)
  gpss.forEach((gps, idx) => {
    const valorTotal = gps.valorINSS + gps.valorOutrasEntidades;
    totalValor += valorTotal;

    lines.push(
      pad(empresa.banco, 3) + lote + "3" +
      padNum(String(idx + 1), 5) +
      "N" + "0" + "00" +
      padNum(gps.codigoPagamento, 4) +
      gps.competencia.padEnd(6) +
      padNum(gps.identificadorContribuinte.replace(/\D/g, ""), 14) +
      padNum(Math.round(gps.valorINSS * 100).toString(), 15) +
      padNum(Math.round(gps.valorOutrasEntidades * 100).toString(), 15) +
      padNum("0", 15) +
      padNum(Math.round(valorTotal * 100).toString(), 15) +
      formatDateCnab(gps.dataVencimento) +
      dataGeracao +
      pad("", 78)
    );
  });

  // Trailer do lote
  lines.push(
    pad(empresa.banco, 3) + lote + "5" +
    pad("", 9) +
    padNum(String(gpss.length + 2), 6) +
    padNum(Math.round(totalValor * 100).toString(), 18) +
    pad("", 171) + pad("", 30) + pad("", 10)
  );

  return { loteLines: lines, totalValor };
}

// ---------------------------------------------------------------------------
// Lote Boletos
// ---------------------------------------------------------------------------

function gerarLoteBoletos(
  empresa: DadosEmpresa,
  boletos: PagamentoBoleto[],
  loteNum: number,
  dataGeracao: string
): { loteLines: string[]; totalValor: number } {
  const lines: string[] = [];
  const lote = padNum(String(loteNum), 4);
  let totalValor = 0;

  lines.push(
    pad(empresa.banco, 3) + lote + "1" +
    "C" + "30" + "00" + "040" + " " +
    "2" + padNum(empresa.cnpj.replace(/\D/g, ""), 14) +
    pad("", 20) +
    padNum(empresa.agencia, 5) + " " +
    padNum(empresa.conta, 12) + empresa.digitoConta.charAt(0) + " " +
    padRight(empresa.razaoSocial, 30) +
    pad("", 40) + padRight("", 30) +
    padNum("0", 5) + padRight("", 15) + padRight("", 20) + pad("", 8) +
    pad("", 10)
  );

  boletos.forEach((bol, idx) => {
    totalValor += bol.valor;

    // Segmento J (boleto com código de barras)
    lines.push(
      pad(empresa.banco, 3) + lote + "3" +
      padNum(String(idx + 1), 5) +
      "J" + "0" + "00" +
      padRight(bol.codigoBarras, 44) +
      padRight(bol.nomeFornecedor, 30) +
      formatDateCnab(bol.dataVencimento) +
      padNum(Math.round(bol.valor * 100).toString(), 15) +
      padNum("0", 15) +  // desconto
      padNum("0", 15) +  // acrescimo
      dataGeracao +
      padNum("0", 15) +  // valor pagamento
      pad("", 40)
    );
  });

  lines.push(
    pad(empresa.banco, 3) + lote + "5" +
    pad("", 9) +
    padNum(String(boletos.length + 2), 6) +
    padNum(Math.round(totalValor * 100).toString(), 18) +
    pad("", 171) + pad("", 30) + pad("", 10)
  );

  return { loteLines: lines, totalValor };
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function pad(str: string, len: number, char = " "): string {
  return str.padEnd(len, char).substring(0, len);
}

function padRight(str: string, len: number): string {
  return str.substring(0, len).padEnd(len);
}

function padNum(str: string, len: number): string {
  return str.replace(/\D/g, "").padStart(len, "0").substring(0, len);
}

function formatDateCnab(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

function formatTimeCnab(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}${mm}${ss}`;
}
