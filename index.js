const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const connection = require('./data/database');
const Pergunta = require('./data/Pergunta');
const Resposta = require('./data/Resposta');

// Database
connection
  .authenticate()
  .then(() => {
    console.log('Conexão feita com o banco de dados!');
  })
  .catch((msgErro) => {
    console.log(msgErro);
  });

// View EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// BodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  Pergunta.findAll({ raw: true, order: [
    ['id', 'DESC']
  ] }).then(perguntas => {
    res.render('index', {
      perguntas: perguntas
    });
  });
});

app.get('/perguntar', (req, res) => {
  res.render('perguntar');
});

app.post('/salvarpergunta', (req,res) => {
  let titulo = req.body.titulo;
  let descricao = req.body.descricao;

  Pergunta.create({
    titulo: titulo,
    descricao: descricao
  }).then(() => {
    res.redirect('/');
  })
});

app.get('/pergunta/:id', (req, res) => {
  let id = req.params.id;
  Pergunta.findOne({
    where: {id: id}
  }).then(pergunta => {
    if(pergunta != undefined) {

      Resposta.findAll({
        where: {perguntaId: pergunta.id},
        order: [ 
          ['id', 'DESC']
        ]
      }).then(respostas => {
        res.render('pergunta',{
          pergunta: pergunta,
          respostas: respostas
        });
      });
    }else {
      res.render('error');
    }
  });
})

app.post('/responder', (req, res) => {
  let corpo = req.body.corpo;
  let perguntaId = req.body.pergunta;
  Resposta.create({
    corpo: corpo,
    perguntaId: perguntaId
  }).then(() => {
    res.redirect('/pergunta/'+perguntaId);
  })
})

app.listen(port, () => {
  console.log('App rodando!');
});