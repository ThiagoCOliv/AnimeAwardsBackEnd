const { filePath, XLSX, workbook } = require('./excel_db');
const metodos = require('./metodos');
const get = require('./get');
const { definirCelula } = require('./utils/funcoes')

function category(categoria)
{
    const planilha = workbook.Sheets[`Categorias ${categoria.tipo}`];
    const dados = XLSX.utils.sheet_to_json(planilha, { header: 1 })

    Array.from(dados[0]).forEach((dado, coluna) => {
        if(dado && dado == categoria.nome)
        {
            for(let linha = 2; linha < categoria.indicados.length + 2; linha++)
            {
                planilha[definirCelula(linha, coluna)] = { v: linha - 1 };

                if(categoria.tipo == "Personagens")
                {
                    if(dado == "Melhor Casal")
                    {
                        planilha[definirCelula(linha, coluna + 4)] = { v: categoria.indicados[linha - 2].anime.id };
                        planilha[definirCelula(linha, coluna + 5)] = { v: categoria.indicados[linha - 2].pontos, t: "n" };
                        planilha[definirCelula(linha, coluna + 1)] = { v: categoria.indicados[linha - 2].casal };
                        planilha[definirCelula(linha, coluna + 2)] = { v: categoria.indicados[linha - 2].imagemA };
                        planilha[definirCelula(linha, coluna + 3)] = { v: categoria.indicados[linha - 2].imagemB };
                    }
                    else
                    {
                        planilha[definirCelula(linha, coluna + 3)] = { v: categoria.indicados[linha - 2].anime.id };
                        planilha[definirCelula(linha, coluna + 4)] = { v: categoria.indicados[linha - 2].pontos, t: "n" };
                        planilha[definirCelula(linha, coluna + 1)] = { v: categoria.indicados[linha - 2].personagem };
                        planilha[definirCelula(linha, coluna + 2)] = { v: categoria.indicados[linha - 2].imagem }
                    }
                }
                else
                {
                    planilha[definirCelula(linha, coluna + 1)] = { t: 's', v: categoria.indicados[linha - 2].anime.id.toString(), h: categoria.indicados[linha - 2].anime.id.toString(), w: categoria.indicados[linha - 2].anime.id.toString() };
                }

                if(categoria.tipo == "Subjetivas" && (dado == "Melhor Encerramento" || dado == "Melhor Abertura"))
                {
                    planilha[definirCelula(linha, coluna + 3)] = { v: categoria.indicados[linha - 2].pontos, t: "n" };
                    planilha[definirCelula(linha, coluna + 2)] = { v: categoria.indicados[linha - 2].numero };
                }
                else if(categoria.tipo != "Personagens")
                {
                    planilha[definirCelula(linha, coluna + 2)] = { v: categoria.indicados[linha - 2].pontos, t: "n" };
                }
            }
        }
    });
    
    XLSX.writeFile(workbook, filePath)
    
    return atualizarAnimes();
}

function anime(anime)
{
    linha = definirLinhaAnime(anime.id);
    animeAtual = get.animeById(anime.id);

    if(linha && animeAtual != anime)
    {
        const planilha = workbook.Sheets[`Animes`];
        
        let celula = 'B' + linha
        if(planilha[celula].v != anime.nome){ planilha[celula].v = anime.nome }
        
        celula = 'C' + linha
        if(planilha[celula].v != anime.imagemURL){ planilha[celula].v = anime.imagemURL }

        celula = 'D' + linha
        if(planilha[celula].v != anime.temporadaAnime)
        {
            if(anime.temporadaAnime == 1)
            {
                metodos.post.indicado(anime, "Melhor Ideia-Proposta");
                metodos.post.indicado(anime, "Melhor Design de Personagens");
            }
            else if(anime.temporadaAnime > 1 && planilha[celula].v == 1)
            {
                metodos.remove.indicado(anime, "Melhor Ideia-Proposta");
                metodos.remove.indicado(anime, "Melhor Design de Personagens");
            }

            planilha[celula].v = anime.temporadaAnime
        }

        celula = 'F' + linha
        if(planilha[celula].v != anime.estudio.join(' - ')){ planilha[celula].v = anime.estudio.join(' - ') }

        celula = 'G' + linha
        if(planilha[celula].v != anime.generos.join(' - '))
        {
            let generosAtuais = planilha[celula].v.split(' - ');
            generosAtuais.forEach(genero => {
                if(!anime.generos.includes(genero))
                {
                    metodos.remove.indicado(anime, `MELHOR ${genero}`)
                }
            })

            anime.generos.forEach(genero => {
                if(!generosAtuais.includes(genero))
                {
                    metodos.post.indicado(anime, `MELHOR ${genero}`)
                }
            })
            planilha[celula].v = anime.generos.join(' - ');
        }

        celula = 'H' + linha
        if(planilha[celula].v != anime.fonte){ planilha[celula].v = anime.fonte }

        return true;
    }

    return false
}

function definirLinhaAnime(id){
    animes = get.allAnimes();

    for (let index = 0; index < animes.length; index++) 
    {
        if(animes[index].id == id)
        {
            return index + 2
        }
    }

    return false;
}

function atualizarAnimes()
{
    categorias = get.allCategories();
    animes = get.allAnimes();

    animes.forEach((anime, linha) => {
        indicacoesAnime = [];

        categorias.forEach(categoria => {
            categoria.indicados.forEach(indicado => {
                if(indicado.anime.id == anime.id)
                {
                    indicacoesAnime.push(indicado)
                }
            })
        })
        
        pontuacaoAnime = indicacoesAnime.reduce((total, atual) => total + atual.pontos, 0)

        const planilha = workbook.Sheets[`Animes`];
        const celula = 'I' + (linha + 2)
        planilha[celula].v = pontuacaoAnime;
    })

    XLSX.writeFile(workbook, filePath)

    return true;
}

module.exports = { category, anime, atualizarAnimes }