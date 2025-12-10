import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCq08FPf6StbmUUCqwWPKSCEwDrd4n9TCE",
  authDomain: "snippet-saver-a37ae.firebaseapp.com",
  projectId: "snippet-saver-a37ae",
  storageBucket: "snippet-saver-a37ae.firebasestorage.app",
  messagingSenderId: "563217543964",
  appId: "1:563217543964:web:23c39b4bbb8974a9d880d9",
  measurementId: "G-6LD8W5SWST"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not supported in this browser');
    }
});

export { auth, db };
export default firebase;