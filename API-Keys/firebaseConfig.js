import * as firebase from 'firebase';
// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCXVhNIqakFF2LovMzlm6eSBLG0-lKVxJQ",
    authDomain: "telltale-f030c.firebaseapp.com",
    databaseURL: "https://telltale-f030c.firebaseio.com",
    projectId: "telltale-f030c",
    storageBucket: "telltale-f030c.appspot.com",
    messagingSenderId: "874700191457"
  };
var firebaseApp = firebase.initializeApp(config);
module.exports.firebaseApp;
