const Indicado = require("../model/Indicado");
const metodos = require('./metodos');
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
        const categorias = metodos.get.allCategories()
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
        metodos.put.category(categoria)
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
        let animes = metodos.get.allAnimes();
        anime.id = animes.length;
    
        const planilha = workbook.Sheets[`Animes`];
        const linha = anime.id + 2;
        
        let celula = "A" + linha;
        planilha[celula].v = anime.id;
    
        celula = "B" + linha;
        planilha[celula].v = anime.nome;
    
        celula = "C" + linha;
        planilha[celula].v = anime.imagemURL;
    
        celula = "D" + linha;
        planilha[celula].v = anime.temporadaAnime;
    
        celula = "E" + linha;
        planilha[celula].v = anime.temporadaLancamento;
    
        celula = "F" + linha;
        planilha[celula].v = anime.estudio.join(' - ');
    
        celula = "G" + linha;
        planilha[celula].v = anime.generos.join(' - ');
    
        celula = "H" + linha;
        planilha[celula].v = anime.fonte;
    
        celula = "I" + linha;
        planilha[celula].v = 0;
    
        XLSX.writeFile(workbook, filePath)
    
        const categoriasSubjetivas = metodos.get.categories("Subjetivas");
    
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
    
        anime.generos.forEach(genero => metodos.post.indicado(anime, `MELHOR ${genero}`))
    
        const categoriasTecnicas = metodos.get.categories("Tecnicas");
    
        categoriasTecnicas.forEach(categoria => {
            if(categoria.nome != "Melhor Design de Personagens" || anime.temporadaAnime == 1)
            {
                indicado(anime, categoria.nome)
            }
        })  
    } 
    catch (error) 
    {
        return false;
    }
    
    return true;
}

module.exports = { indicado, anime }