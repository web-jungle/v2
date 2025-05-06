// Script de test pour créer un événement avec les propriétés formatées correctement
// Pour exécuter: node test-create-event.js

const testEvent = {
  id: String(new Date().getTime()),
  title: "Test Événement",
  start: new Date(),
  end: new Date(new Date().getTime() + 3600000), // +1 heure
  collaborateurId: "VOTRE_ID_COLLABORATEUR", // Remplacer par un ID valide
  typeEvenement: "presence",
  lieuChantier: "Test",
  zoneTrajet: "1A",
  panierRepas: false,
  heuresSupplementaires: 0,
  grandDeplacement: false,
  prgd: true,
  nombrePrgd: 1, // Utilise la bonne casse pour nombrePrgd
  verrouille: false,
  ticketRestaurant: false,
};

console.log("Données de test à envoyer:", testEvent);

// Simuler l'envoi à l'API
fetch('http://localhost:3000/api/evenements', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testEvent),
})
.then(response => response.json())
.then(data => {
  console.log("Réponse de l'API:", data);
})
.catch(error => {
  console.error("Erreur:", error);
}); 