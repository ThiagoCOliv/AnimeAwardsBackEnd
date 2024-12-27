const Indicado = require("../model/Indicado");
const { categories, animeById, lastId, category } = require('./get');
const { filePath, XLSX, workbook } = require('./excel_db');
const { definirCelula } = require('./utils/funcoes')

function definirPontuacao(indicados)
{
    let pontosIndicado = 10;

    if(indicados.length > 0)
    {
        menorPontuacao = indicados[indicados.length - 1].pontos;
        pontosIndicado = menorPontuacao > 0 ? menorPontuacao - 1 : 0;
    }

    return pontosIndicado
}

function atualizarNumeroLinhas(sheet, linha) {
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    range.e.r = Math.max(range.e.r, linha);
    sheet['!ref'] = XLSX.utils.encode_range(range);
}

function capitalize(text) {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function indicado(anime, categoria, personagem, numero)
{
    try 
    {
        const planilha = workbook.Sheets[`Categorias ${categoria.tipo}`];
        const dados = XLSX.utils.sheet_to_json(planilha, { header: 1 });
        const linha = categoria.indicados.length + 2;

        Array.from(dados[0]).forEach((dado, coluna) => {
            if(dado && dado == categoria.nome)
            {
                planilha[definirCelula(linha, coluna)] = { v: categoria.indicados.length + 1, t: "n" }

                if(categoria.tipo == "Personagens")
                {
                    if(dado == "Melhor Casal")
                    {
                        planilha[definirCelula(linha, coluna + 4)] = { v: anime.id, t: "n" };
                        planilha[definirCelula(linha, coluna + 5)] = { v: definirPontuacao(categoria.indicados), t: "n" };
                        planilha[definirCelula(linha, coluna + 1)] = { v: personagem.casal };
                        planilha[definirCelula(linha, coluna + 2)] = { v: personagem.imagemA };
                        planilha[definirCelula(linha, coluna + 3)] = { v: personagem.imagemB };
                    }
                    else
                    {
                        planilha[definirCelula(linha, coluna + 3)] = { v: anime.id, t: "n" };
                        planilha[definirCelula(linha, coluna + 4)] = { v: definirPontuacao(categoria.indicados), t: "n" };
                        planilha[definirCelula(linha, coluna + 1)] = { v: personagem.nome };
                        planilha[definirCelula(linha, coluna + 2)] = { v: personagem.imagem }
                    }
                }
                else
                {
                    planilha[definirCelula(linha, coluna + 1)] = { v: anime.id, t: "n" };
                }
                
                if(categoria.tipo == "Subjetivas" && (dado == "Melhor Encerramento" || dado == "Melhor Abertura"))
                {
                    planilha[definirCelula(linha, coluna + 3)] = { v: definirPontuacao(categoria.indicados), t: "n" };
                    planilha[definirCelula(linha, coluna + 2)] = { v: numero, t: "n" };
                }
                else if(categoria.tipo != "Personagens")
                {
                    planilha[definirCelula(linha, coluna + 2)] = { v: definirPontuacao(categoria.indicados), t: "n" };
                }
            }
        })

        atualizarNumeroLinhas(planilha, linha);
        XLSX.writeFile(workbook, filePath);
    } 
    catch (error) 
    {
        console.error(error)
        return false
    }

    return true
}

function anime(anime)
{
    try 
    {
        anime.id = lastId() + 1;
    
        const planilha = workbook.Sheets[`Animes`];
        const linha = anime.id + 1;
        
        planilha["A" + linha] = { v: anime.id, t: "n" };
        planilha["B" + linha] = { v: anime.nome, t: "s" };
        planilha["C" + linha] = { v: anime.imagemURL, t: "s" };
        planilha["D" + linha] = { v: anime.temporadaAnime, t: "n" };
        planilha["E" + linha] = { v: anime.temporadaLancamento.join(' - '), t: "s" };
        planilha["F" + linha] = { v: anime.estudio.join(' - '), t: "s" };
        planilha["G" + linha] = { v: anime.generos.join(' - '), t: "s" };
        planilha["H" + linha] = { v: anime.fonte, t: "s" };
        planilha["I" + linha] = { v: 0, t: "n" };

        atualizarNumeroLinhas(planilha, linha)
        
        XLSX.writeFile(workbook, filePath);

        animeById(anime.id) ? console.log('sucesso') : (() => { throw new Error('Erro ao criar anime'); })()
    
        categories("Subjetivas").forEach(categoria => {
            if(categoria.nome == "Melhor Ideia-Proposta" && anime.temporadaAnime == 1)
            {
                indicado(anime, categoria)
            }
            else if(categoria.nome == "Melhor Original" && anime.fonte == "ORIGINAL")
            {
                indicado(anime, categoria)
            }
            else if(categoria.nome == "Melhor Adaptação" && anime.fonte != "ORIGINAL")
            {
                indicado(anime, categoria)
            }
            else if(categoria.nome == "Melhor História-Roteiro")
            {
                indicado(anime, categoria)
            }
        })
    
        anime.generos.forEach(genero => {
            genero == "SLICE OF LIFE" ? indicado(anime, category("Melhor Slice of Life")) : indicado(anime, category(`Melhor ${capitalize(genero)}`))
        })
    
        categories("Tecnicas").forEach(categoria => {
            if(categoria.nome != "Melhor Design de Personagens" || anime.temporadaAnime == 1)
            {
                indicado(anime, categoria)
            }
        })
    } 
    catch (error)
    {
        console.error(error)
        return false;
    }
    
    return true;
}

module.exports = { indicado, anime }