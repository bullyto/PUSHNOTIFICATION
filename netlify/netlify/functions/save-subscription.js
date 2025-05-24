const fs = require('fs');
const path = require('path');

const subscriptionsPath = path.join(__dirname, '..', '..', 'subscriptions.json');

exports.handler = async function(event) {
  try {
    const newSub = JSON.parse(event.body);
    let subs = [];

    try {
      const data = fs.readFileSync(subscriptionsPath);
      subs = JSON.parse(data);
    } catch (err) {
      // Fichier absent ou JSON invalide, on continue avec tableau vide
    }

    // Évite les doublons
    const exists = subs.some(sub => sub.endpoint === newSub.endpoint);
    if (!exists) {
      subs.push(newSub);
      fs.writeFileSync(subscriptionsPath, JSON.stringify(subs, null, 2));
    }

    return { statusCode: 200, body: "Subscription saved" };
  } catch (error) {
    return { statusCode: 400, body: "Invalid subscription data" };
  }
};
