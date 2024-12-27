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
    return animes[animes.length - 1].id
}

function categories(tipoCategoria)
{
    const planilha = workbook.Sheets[`Categorias ${tipoCategoria}`];
    const dados = XLSX.utils.sheet_to_json(planilha, { header: 1 })

    let categoriasLista = []

    Array.from(dados[0]).forEach((dado, coluna) => {
        let indicados = [];
        
        if(dado)
        {
            for(let linha = 2; linha < dados.length; linha++)
            {
                if(dados[linha][coluna + 1])
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
                    
                    indicados.push(indicado)
                }
            }
            
            const categoria = new Categoria(dado, indicados, tipoCategoria)
            categoriasLista.push(categoria)
        }
    });

    return categoriasLista;
}

function allCategories(){
    const subjetivas = categories("Subjetivas");
    const generos = categories("Generos");
    const tecnicas = categories("Tecnicas");
    const personagens = categories("Personagens");

    categorias = [...subjetivas, ...generos, ...tecnicas, ...personagens]

    return categorias;
}

function topAnimes(){
    const animesOrdemPontuacao = animes.length == 0 ? allAnimes().sort((a, b) => b.pontos - a.pontos) : animes.sort((a, b) => b.pontos - a.pontos);
    const topAnimes = animesOrdemPontuacao.slice(0, 10);

    return topAnimes;
}

function animeByCategory(categoria){
    return animes.length > 0 ? animes.filter(anime => anime.generos.includes(categoria.toUpperCase())) : allAnimes().filter(anime => anime.generos.includes(categoria.toUpperCase()));
}

function animeById(id){
    return allAnimes().filter(anime => anime.id == id)[0];
}

function category(categoriaNome){
    return categorias.length > 0 ? categorias.filter(categoria => categoria.nome == categoriaNome)[0] : allCategories().filter(categoria => categoria.nome == categoriaNome)[0];
}

module.exports = {
    allAnimes,
    topAnimes,
    allCategories,
    animeByCategory,
    animeById,
    categories,
    category,
    lastId
};