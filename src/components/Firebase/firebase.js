// ============================================================================
// @description Firebase Config und Datenbank-API
// @see         https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial
// ============================================================================

import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// Production
const prodConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

// Development
const devConfig = {
    apiKey: process.env.REACT_APP_DEV_API_KEY,
    authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DEV_DATABASE_URL,
    projectId: process.env.REACT_APP_DEV_PROJECT_ID,
    storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID,
  };
   
  const config =
    process.env.NODE_ENV === 'production' ? prodConfig : devConfig;


class Firebase {
    constructor() {
        var primary = app.initializeApp(config);
        var secondary = app.initializeApp(config, "secondary");

        this.auth = primary.auth();
        this.db = primary.database();

        this.secondaryAuth = secondary.auth();
    }

    // *** Auth API ***

    doCreateUserWithEmailAndPassword = (email, password) =>
        this.secondaryAuth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password =>
        this.auth.currentUser.updatePassword(password);

    // *** Merge Auth and DB User API *** //
    onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
        if (authUser) {
        this.user(authUser.uid)
            .once('value')
            .then(snapshot => {
            const dbUser = snapshot.val();
            if (!dbUser.isAdmin) {
                dbUser.isAdmin = false;
            }
            authUser = {
                uid: authUser.uid,
                email: authUser.email,
                ...dbUser,
            };
            next(authUser);
            });
        } else {
        fallback();
        }
    });

    // *** User API ***
    user = uid => this.db.ref(`users/${uid}`);
    users = () => this.db.ref('users');

    // *** Articles API ***
    item = uid => this.db.ref(`items/${uid}`);
    items = () => this.db.ref(`items`);   
    
    // *** Stock Log Messages API ***
    logMessage = uid => this.db.ref(`logMessages/${uid}`);
    logMessages = () => this.db.ref(`logMessages`);  
}

export default Firebase;