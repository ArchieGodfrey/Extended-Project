import * as firebase from 'firebase';
// Initialize Firebase
var config = {
   apiKey: "AIzaSyAuC_xqXKk99bTeaCluuoJhqNfJFQNlv1E",
   authDomain: "epproject-a2ea7.firebaseapp.com",
   databaseURL: "https://epproject-a2ea7.firebaseio.com",
   storageBucket: "epproject-a2ea7.appspot.com",
   messagingSenderId: "638364827583"
};
var firebaseApp = firebase.initializeApp(config);
module.exports.firebaseApp;
