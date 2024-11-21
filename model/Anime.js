class Anime {
    constructor(id, nome, imagemURL, temporadaAnime, temporadaLancamento, estudio, generos, fonte, pontos) {
        this.id = id;
        this.nome = nome;
        this.imagemURL = imagemURL;
        this.temporadaAnime = temporadaAnime;
        this.temporadaLancamento = temporadaLancamento;
        this.estudio = estudio;
        this.generos = generos;
        this.fonte = fonte
        this.pontos = pontos;
    }
}

module.exports = Anime;