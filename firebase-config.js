import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB4S5S7VRi-iMnQv1qs8BeJFBCyOSdMu9k",
    authDomain: "adressegroupe-7e2df.firebaseapp.com",
    projectId: "adressegroupe-7e2df",
    storageBucket: "adressegroupe-7e2df.appspot.com",
    messagingSenderId: "477711767471",
    appId: "1:477711767471:web:90c4703978497f132a015a",
    measurementId: "G-8LYCHKMXE0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
