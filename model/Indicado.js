class Indicado{
    constructor(anime, pontos, abertura, personagem) {
        this.anime = anime;
        this.pontos = pontos;

        if(abertura){
            this.numero = abertura
        }

        if(personagem){
            if(personagem.casal){
                this.casal = personagem.casal;
                this.imagemA = personagem.imagemA;
                this.imagemB = personagem.imagemB;
            }else{
                this.personagem = personagem.nome;
                this.imagem = personagem.imagem;
            }
        }
    }
}

module.exports = Indicado;