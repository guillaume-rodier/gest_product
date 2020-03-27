// L'application requiert l'utilisation du module Express.
// La variable express nous permettra d'utiliser les fonctionnalités du module Express.
const express = require('express'),
      fs = require('fs'),
      bdd_name = "bdd.json",
      bodyParser = require("body-parser");

// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost';
var port = 3000;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
// C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes.
var myRouter = express.Router();

// Recevoir les données du fichier
function getbdd() {
    return JSON.parse(fs.readFileSync(bdd_name,'utf8'));
}

// Insertion en base de données
function insertbdd(data) {
    var json = JSON.stringify(data, null, 2);

    fs.writeFile ("bdd.json", json, function(err) {
        if (err) throw err;
            console.log('Merge completed and writed in bdd.json');
        }
    );
}

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
    // On récupère les données du fichier json
    var data = getbdd();

    // On envoie en JSON plusieurs paramètres
    res.json(
        {
            message : "Liste touts les produits disponibles.",
            methode : req.method,
            data: data
        }
    );
});

myRouter.route('/product/:product_id')
.get(function(req,res){
    // On récupère les données du fichier json
    var data = getbdd();

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
    var data = getbdd();

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
      insertbdd(data);
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
    var data = getbdd();

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
    insertbdd(data);

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
    var data = getbdd();
    data.remove(data.find(product => product.uuid === req.params.product_id));

    // On envoie en JSON plusieurs paramètres
    res.json(
        {
            message : "Vous souhaitez supprimer le produit n°" + req.params.product_id,
            methode : req.method,
            data : data
        }
    );
});

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

// Démarrer le serveur
app.listen(port, hostname, function(){
  	console.log("Mon serveur fonctionne sur http://"+ hostname + ":" + port);
});
