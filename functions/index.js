// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/* Listens for changes in the database
exports.checkExpirationDate = functions.database.ref('UserID/{userID}/posts/{postDate}/expiration')
    .onUpdate(event => {
        const expired = event.data.val()
        
    });
*/