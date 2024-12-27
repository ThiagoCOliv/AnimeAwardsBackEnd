function definirCelula(linha, coluna)
{
    const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let colunaLetras = '';
    
    while (coluna >= 0) {
        colunaLetras = alfabeto[coluna % 26] + colunaLetras;
        coluna = Math.floor(coluna / 26) - 1;
    }
    
    return colunaLetras + (linha + 1);
}

module.exports = { definirCelula }