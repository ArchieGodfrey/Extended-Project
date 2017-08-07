// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Listens for changes in the database
exports.bullyingReport = functions.database.ref('Reports/Harrassment or bullying/{DATE}/{postDate}')
    .onUpdate(event => {
        console.log(event.data.val())
        
    });

exports.nudityReport = functions.database.ref('Reports/Nudity or pornography/{DATE}/{postDate}')
    .onUpdate(event => {
        console.log(event.data.val())
        
    });

exports.violenceReport = functions.database.ref('Reports/Violence or harm/{DATE}/{postDate}')
    .onUpdate(event => {
        console.log(event.data.val())
        
    });

exports.racismReport = functions.database.ref('Reports/Hate speech or symbols/{DATE}/{postDate}')
    .onUpdate(event => {
        console.log(event.data.val())
        
    });

exports.intellectualPropertyReport = functions.database.ref('Reports/Intellectual property violation/{DATE}/{postDate}')
    .onUpdate(event => {
        console.log(event.data.val())
        
    });

exports.generalReport = functions.database.ref("Reports/I just don't like it/{DATE}/{postDate}")
    .onUpdate(event => {
        console.log(event.data.val())
        
    });
