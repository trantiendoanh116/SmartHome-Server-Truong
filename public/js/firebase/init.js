var firebaseConfig = {
    apiKey: "AIzaSyCZkXut96ZTsANIFBjxqsxI6eWFg1C5YXM",
    authDomain: "smarthome-116.firebaseapp.com",
    databaseURL: "https://smarthome-116.firebaseio.com",
    projectId: "smarthome-116",
    storageBucket: "smarthome-116.appspot.com",
    messagingSenderId: "1055864949441",
    appId: "1:1055864949441:web:ea1474b982167625cde240"
};

// Initialize Firebase
if (!firebase.apps.length) {
    var app = firebase.initializeApp(firebaseConfig);
 }