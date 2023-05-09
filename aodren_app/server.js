const express = require('express');
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); 

// Créer une connexion à la base de données SQLite
const db = new sqlite3.Database('Gestion_Stock.db');
console.log(db)
// Définir une route pour récupérer des données depuis la base de données
app.get('/getproduits', (req, res) => {
  db.all('SELECT * FROM Produits', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur du serveur');
    } else {
      res.json(rows);
    }
  });
});

app.get('/getproduit/:id', (req, res) => {
  const produitId = req.params.id;
  db.all('SELECT * FROM Pieces WHERE id_produit = ?', [produitId], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur du serveur');
    } else {
      res.json(rows);
    }
  });
});

app.post('/addprise', (req, res) => {
  const { pole, id_piece, cause, quantite ,date } = req.body;
  // Vérifier si toutes les données nécessaires sont fournies
  if (!pole || !id_piece || !cause || !quantite || !date) {
    res.status(400).send('Paramètres manquants');
    return;
  }

  // Insérer la nouvelle donnée dans la base de données
  db.run(
    'INSERT INTO Prise (pole, id_piece, cause, quantite, date) VALUES (?, ?, ?, ?, ?)',
    [pole, id_piece, cause, quantite, date],
  );

  db.run(
    'UPDATE Pieces SET stock = (stock - ?) WHERE id = ?',
    [quantite, id_piece],
  );
});

app.post('/addmise', (req, res) => {
  const { pole, id_piece, quantite, date } = req.body;
  // Vérifier si toutes les données nécessaires sont fournies
  if (!pole || !id_piece || !quantite || !date) {
    res.status(400).send('Paramètres manquants');
    return;
  }
  // Insérer la nouvelle donnée dans la base de données
  db.run(
    'INSERT INTO Mise (pole, id_piece, quantite, date) VALUES (?, ?, ?, ?)',
    [pole, id_piece, quantite, date],
  );

  db.run(
    'UPDATE Pieces SET stock = (stock + ?) WHERE id = ?',
    [quantite, id_piece],
  );

});



// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
