// L'application requiert l'utilisation du module Express.
// La variable express nous permettra d'utiliser les fonctionnalités du module Express.
const express = require('express'),
      fs = require('fs'),
      bodyParser = require('body-parser'),
      product = require('./product'),
      bdd = require('./bdd.js'),
      hostname = 'localhost',
      port = 3000,
      app = express();

// Création d'un nouvel objet pour la base de données
var infoBDD = new bdd();

// Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
// C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes.
var myRouter = express.Router();

// Paramétrage de l'app
app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json());

myRouter.route('/')
// all permet de prendre en charge toutes les méthodes.
.all(function(req,res){
    res.json(
        {
            message : "Bienvenue sur mon API.",
            methode : req.method
        }
    );
});

// Je vous rappelle notre route (/product)
myRouter.route('/products')
// J'implémente les méthodes GET, PUT, UPDATE et DELETE
// GET
.get(function(req,res){
    // On envoie en JSON plusieurs paramètres
    res.json(
        {
            message : "Liste tous les produits disponibles.",
            methode : req.method,
            data: infoBDD.getbdd()
        }
    );
});

myRouter.route('/product/:product_id')
.get(function(req,res){
    // On récupère les données du fichier json
    var data = infoBDD.getbdd();

    // On récupère l'objet
    var myObject = data.find(product => product.uuid === req.params.product_id);

    // On envoie en JSON plusieurs paramètres
	  res.json(
        {
            message : "Vous souhaitez accéder aux informations du produit n°" + req.params.product_id + ".",
            methode : req.method,
            data : data,
            accessObject : myObject
        }
    );
})
.post(function(req,res){
    // On récupère les données du fichier json
    var data = infoBDD.getbdd();

    // Message de base
    var message = "Vous souhaitez créer le produit n°" + req.params.product_id + ".";

    // On créé l'objet avec les paramètres
    var bodyObject = {
        uuid: req.params.product_id,
        name: req.body.name,
        price: parseFloat(req.body.price),
        type: req.body.type,
        enabled: Boolean(req.body.enabled)
    };

    // Si on trouve l'id du produit, on empêche sa réinsertion
    if (data.find(product => product.uuid === req.params.product_id)) {
        message += " L'identifiant a été trouvé. Ce produit ne peut être ajouté !"
    } else {
      // On insère le produit dans le tableau
      data.push(bodyObject);
      // On écrit les données dans le fichier
      infoBDD.insertbdd(data);
    }

    // On envoie en JSON plusieurs paramètres
    res.json(
        {
            message : message,
            methode : req.method,
            data : data
        }
    );
})
.put(function(req,res){
    // On récupère les données du fichier json
    var data = infoBDD.getbdd();

    // On cherche le produit dans la base de données
    data.forEach(
        function(product, i) {
            // Si on le trouve, on remplace les données par les paramètres récupérés
            if (product.uuid == req.params.product_id) {
                data[i].name = req.body.name;
                data[i].price = parseFloat(req.body.price);
                data[i].type = req.body.type;
                data[i].enabled = Boolean(req.body.enabled);
            }
        }
    );

    // On écrit les données dans la base de données
    infoBDD.insertbdd(data);

    // On envoie en JSON plusieurs paramètres
    res.json(
        {
            message : "Vous souhaitez modifier le produit n°" + req.params.product_id,
            methode : req.method,
            data : data
        }
    );
})
.delete(function(req,res){
    // On récupère les données du fichier json
    var data = infoBDD.getbdd();
    // data.remove(data.find(product => product.uuid === req.params.product_id));

    var filtered = data.filter(function(element) { return element.uuid != req.params.product_id; });

    // On écrit les données dans la base de données
    infoBDD.insertbdd(filtered);

    // On envoie en JSON plusieurs paramètres
    res.json(
        {
            message : "Vous souhaitez supprimer le produit n°" + req.params.product_id,
            methode : req.method,
            data : filtered
        }
    );
});

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

// Démarrer le serveur
app.listen(port, hostname, function(){
  	console.log("Mon serveur fonctionne sur http://"+ hostname + ":" + port);
});
