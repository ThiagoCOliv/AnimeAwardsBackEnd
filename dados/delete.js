const metodos = require('./metodos')

function indicado(anime, categoriaNome)
{
    const categorias = metodos.get.allCategories()

    let categoria = categorias.find(cat => cat.nome.toUpperCase() == categoriaNome.toUpperCase());
    let animesIndicados = categoria.indicados;
    let indicacaoAnime = animesIndicados.find(indicacao => indicacao.anime == anime);

    if(indicacaoAnime)
    {
        const indice = animesIndicados.indexOf(indicacaoAnime);

        if(indicacaoAnime.pontos > 0 && indice + 1 != animesIndicados.length)
        {
            for (let index = indice + 1; index < Math.min(animesIndicados.length, 11); index++) 
            {
                animesIndicados[index].pontos++;
            }
        }

        animesIndicados.splice(indice, 1);
        categoria.indicados = animesIndicados
        metodos.put.category(categoria)
    }
}

module.exports = { indicado }