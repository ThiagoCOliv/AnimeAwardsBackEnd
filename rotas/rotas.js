const express = require('express')
const router = express.Router();

const dados = require('../dados/metodos');
dados.put.atualizarAnimes();

router.get('/animes', (req, res) => {
    const animes = req.query.genero ? dados.get.animeByCategory(req.query.genero) : dados.get.allAnimes();
    animes.length > 0 ? res.status(200).send(animes) : res.status(404).send({ mensagem: "Animes não encontrados" });
})

router.get('/generos', (req, res) => res.status(200).send(dados.get.generos()))

router.get('/animes/top', (req, res) => {
    const animes = dados.get.topAnimes();
    animes.length > 0 ? res.status(200).send(animes) : res.status(404).send({ mensagem: "Animes não encontrados" });
})

router.get('/animes/:id', (req, res) => {
    const anime = dados.get.animeById(req.params.id);
    anime ? res.status(200).send({anime, vitorias: dados.get.checarVitorias(anime)}) : res.status(404).send({ mensagem: "Anime não encontrado!" });
})

router.get('/categorias', (req, res) => {
    const categorias = dados.get.allCategories()
    res.status(200).send(categorias);
})

router.get('/categoria/:nome', (req, res) => {
    const categoria = dados.get.category(req.params.nome);
    categoria ? res.status(200).send(categoria) : res.status(404).send({ mensagem: "Categoria não encontrada" });
})

router.post('/anime', (req, res) => {
    const animeAdicionado = dados.post.anime(req.body);
    if(animeAdicionado)
    {
        dados.put.atualizarAnimes();
        res.status(201).send({ mensagem: "Anime adicionado com sucesso!", dados: animeAdicionado })
    }
    else
    {
        res.status(501).send({ mensagem: "Erro na adição do anime!" })
    }
})

router.post('/indicado', (req, res) => {
    const { anime, categoria, personagem, numero } = req.body
    const indicacaoAdicionada = dados.post.indicado(anime, categoria, personagem, numero);
    if(indicacaoAdicionada)
    {
        dados.put.atualizarAnimes();
        res.status(201).send({mensagem: "Indicado adicionado com sucesso!"})
    }
    else
    {
        res.status(501).send({mensagem: "Erro na adição do indicado!"})
    }
})

router.put('/categoria', (req, res) => {
    const categoriaFoiAtualizada = dados.put.category(req.body)
    categoriaFoiAtualizada ? res.status(201).send({mensagem: "Categoria atualizada com sucesso!"}) : res.status(501).send({mensagem: "Erro na atualização da categoria!"})
})

router.put('/anime', (req, res) => {
    const animeFoiAtualizado = dados.put.anime(req.body);
    animeFoiAtualizado ? res.status(201).send({mensagem: "Anime atualizado com sucesso!"}) : res.status(501).send({mensagem: "Erro na atualização do anime!"})
})

module.exports = router;