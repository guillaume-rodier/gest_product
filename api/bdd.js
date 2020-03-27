const fs = require('fs'),
      bdd_name = "bdd.json";

module.exports = function () {
    // Recevoir les données du fichier
    this.getbdd = function getbdd() {
        return JSON.parse(fs.readFileSync(bdd_name,'utf8'));
    };

    // Insertion en base de données
    this.insertbdd = function insertbdd(data) {
        var json = JSON.stringify(data, null, 2);

        fs.writeFile (bdd_name, json, function(err) {
            if (err) throw err;
                console.log('Merge completed and writed in bdd.json');
            }
        );
    };
}
