const { XLSX, workbook } = require('./excel_db');

const Anime = require('../model/Anime');
const Categoria = require("../model/Categoria");
const Indicado = require("../model/Indicado");

let animes = [];
let categorias = [];

function allAnimes() {
    animes = [];

    const worksheet = workbook.Sheets["Animes"];

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    for (let index = 1; index < data.length; index++)
    {
        const [id, nome, imagem_url, temporada_anime, temporada_lancamento, estudio, generos, fonte, pontos] = data[index];
        
        if(id)
        {
            const animeObj = new Anime(id, nome, imagem_url, temporada_anime, temporada_lancamento, estudio.split(' - '), generos.split(' - '), fonte, pontos);
            animes.push(animeObj)
        }
    }
    
    return animes
}

function lastId() {
    const animes = allAnimes().sort((a, b) => a.id - b.id)
    return animes.length > 0 ? animes[animes.length - 1].id : 0;
}

function categories(tipoCategoria)
{
    const planilha = workbook.Sheets[`Categorias ${tipoCategoria}`];
    const dados = XLSX.utils.sheet_to_json(planilha, { header: 1 })

    let categoriasLista = []
    
    if(dados.length > 0) Array.from(dados[0]).forEach((dado, coluna) => {
        let indicados = [];
        
        if(dado)
        {
            for(let linha = 2; linha < dados.length; linha++)
            {
                if(dados[linha][coluna])
                {
                    let animeIndicado = animeById(dados[linha][coluna + 1]);
                    let indicado = new Indicado(animeIndicado, dados[linha][coluna + 2], null, null);
                    
                    if(tipoCategoria == "Personagens")
                    {
                        if(dado == "Melhor Casal")
                        {
                            animeIndicado = animeById(dados[linha][coluna + 4]);

                            indicado.pontos = dados[linha][coluna + 5];
                            indicado.casal = dados[linha][coluna + 1];
                            indicado.imagemA = dados[linha][coluna + 2]
                            indicado.imagemB = dados[linha][coluna + 3]
                        }
                        else
                        {
                            animeIndicado = animeById(dados[linha][coluna + 3]);
                            
                            indicado.pontos = dados[linha][coluna + 4];
                            indicado.personagem = dados[linha][coluna + 1];
                            indicado.imagem = dados[linha][coluna + 2];
                        }

                        indicado.anime = animeIndicado;
                    }
                    
                    if(tipoCategoria == "Subjetivas" && (dado == "Melhor Encerramento" || dado == "Melhor Abertura"))
                    {
                        indicado.pontos = dados[linha][coluna + 3];
                        indicado.numero = dados[linha][coluna + 2];
                    }
                    
                    indicados.push(indicado);
                }
            }

            const categoria = new Categoria(dado, indicados, tipoCategoria)
            categoriasLista.push(categoria)
        }
    });
    
    return categoriasLista;
}

function allCategories(){
    categorias = [];
    
    const subjetivas = categories("Subjetivas");
    if(subjetivas.length > 0) categorias.push(...subjetivas);
    
    const generos = categories("Generos");
    if(generos.length > 0) categorias.push(...generos);
    
    const tecnicas = categories("Tecnicas");
    if(tecnicas.length > 0) categorias.push(...tecnicas);
    
    const personagens = categories("Personagens");
    if(personagens.length > 0) categorias.push(...personagens);

    return categorias;
}

function topAnimes(){
    return allAnimes().sort((a, b) => b.pontos - a.pontos).slice(0, 10);
}

function animeByCategory(categoria){
    return allAnimes().filter(anime => anime.generos.includes(categoria));
}

function animeById(id){
    return allAnimes().filter(anime => anime.id == id)[0];
}

function category(categoriaNome){
    return allCategories().filter(categoria => categoria.nome == categoriaNome)[0];
}

function checarVitorias(anime){
    categoriasVencidas = [];
    animes = allAnimes();

    animeOfTheYear = {
        nome: "Anime do Ano",
        indicados: animes,
        tipo: "Geral"
    }

    categoriasVencidas = 
        animes.some(anim => anim.pontos > anime.pontos) ? 
        allCategories().filter(categoria => {
            if(categoria.indicados.length > 0 && categoria.indicados[0].anime.id == anime.id) return categoria
        }) :
        [animeOfTheYear, ...allCategories().filter(categoria => {
            if(categoria.indicados.length > 0 && categoria.indicados[0].anime.id == anime.id) return categoria
        })];

    return categoriasVencidas
}

function generos()
{
    const planilha = workbook.Sheets[`Categorias Generos`];
    return XLSX.utils.sheet_to_json(planilha, { header: 1 });
}

module.exports = {
    allAnimes,
    topAnimes,
    allCategories,
    animeByCategory,
    animeById,
    categories,
    category,
    lastId,
    checarVitorias,
    generos
};