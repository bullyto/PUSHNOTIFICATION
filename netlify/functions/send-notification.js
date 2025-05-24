const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

// Récupération des clés depuis les variables d'environnement Netlify
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  'mailto:contact@example.com', // remplace si tu veux
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

exports.handler = async function (event) {
  const body = JSON.parse(event.body);
  const subscriptionsPath = path.join(__dirname, 'subscriptions.json');

  let subscriptions = [];
  try {
    subscriptions = JSON.parse(fs.readFileSync(subscriptionsPath));
  } catch (err) {
    return { statusCode: 500, body: 'Erreur lors de la lecture des abonnements.' };
  }

  const notificationPayload = JSON.stringify({
    title: body.title,
    body: body.body,
    icon: body.icon,
    url: body.url
  });

  const sendAll = subscriptions.map(sub =>
    webpush.sendNotification(sub, notificationPayload)
      .catch(err => {
        console.error('Erreur envoi vers un abonné :', err);
      })
  );

  await Promise.all(sendAll);

  return {
    statusCode: 200,
    body: 'Notifications envoyées'
  };
};
