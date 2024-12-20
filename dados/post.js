const Indicado = require("../model/Indicado");
const { category } = require('./put');
const { allCategories, categories, animeById, lastId } = require('./get');
const { filePath, XLSX, workbook } = require('./excel_db');

function definirPontuacao(indicados)
{
    let pontosIndicado = 10;

    if(indicados.length > 0)
    {
        menorPontuacao = categoria.indicados[categoria.indicados.length - 1].pontos;
        pontosIndicado = menorPontuacao > 0 ? menorPontuacao - 1 : 0;
    }

    return pontosIndicado
}

function indicado(anime, categoriaNome, personagem, numero)
{
    try 
    {
        const categorias = allCategories()
        let categoria = categorias.find(cat => cat.nome.toUpperCase() == categoriaNome.toUpperCase());

        let indicado;
        
        if(categoria.tipo == "Personagens")
        {
            indicado = new Indicado(anime, definirPontuacao(categoria.indicados), null, personagem);
        }
        else if(categoriaNome == "Melhor Abertura" || categoriaNome == "Melhor Encerramento")
        {
            indicado = new Indicado(anime, definirPontuacao(categoria.indicados), numero);
        }
        else
        {
            indicado = new Indicado(anime, definirPontuacao(categoria.indicados));
        }

        categoria.indicados.push(indicado);
        category(categoria)
    } 
    catch (error) 
    {
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
        const linha = anime.id + 2;
        
        console.log(anime)
        let celula = "A" + linha;
        planilha[celula] = { v: anime.id, t: "n" };
    
        celula = "B" + linha;
        planilha[celula] = { v: anime.nome, t: "s" };
    
        celula = "C" + linha;
        planilha[celula] = { v: anime.imagemURL, t: "s" };
    
        celula = "D" + linha;
        planilha[celula] = { v: anime.temporadaAnime, t: "n" };
    
        celula = "E" + linha;
        planilha[celula] = { v: anime.temporadaLancamento.join(' - '), t: "s" };
    
        celula = "F" + linha;
        planilha[celula] = { v: anime.estudio.join(' - '), t: "s" };
    
        celula = "G" + linha;
        planilha[celula] = { v: anime.generos.join(' - '), t: "s" };
    
        celula = "H" + linha;
        planilha[celula] = { v: anime.fonte, t: "s" };
    
        celula = "I" + linha;
        planilha[celula] = { v: 0, t: "n" };
    
        XLSX.writeFile(workbook, filePath)
    
        const categoriasSubjetivas = categories("Subjetivas");
    
        categoriasSubjetivas.forEach(categoria => {
            if(categoria.nome == "Melhor Ideia-Proposta" && anime.temporadaAnime == 1)
            {
                indicado(anime, categoria.nome)
            }
            else if(categoria.nome == "Melhor Original" && anime.fonte == "ORIGINAL")
            {
                indicado(anime, categoria.nome)
            }
            else if(categoria.nome == "Melhor Adaptação" && anime.fonte != "ORIGINAL")
            {
                indicado(anime, categoria.nome)
            }
            else if(categoria.nome == "Melhor História-Roteiro")
            {
                indicado(anime, categoria.nome)
            }
        })
    
        anime.generos.forEach(genero => indicado(anime, `MELHOR ${genero}`))
    
        const categoriasTecnicas = categories("Tecnicas");
    
        categoriasTecnicas.forEach(categoria => {
            if(categoria.nome != "Melhor Design de Personagens" || anime.temporadaAnime == 1)
            {
                indicado(anime, categoria.nome)
            }
        })

        const animeCriado = animeById(anime.id)
        animeCriado ? console.log('sucesso') : (() => { throw new Error('Erro ao criar anime'); })()
    } 
    catch (error)
    {
        console.error(error)
        return false;
    }
    
    return true;
}

module.exports = { indicado, anime }