// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { getDatabase, set, ref, get, child, onValue } from 'firebase/database';
import Notiflix from 'notiflix';

const firebaseConfig = {
  apiKey: 'AIzaSyC21irvS_Vtx8oDn1M3olbsyDbGLdW0Zhg',
  authDomain: 'testauthproject-2a6bd.firebaseapp.com',
  projectId: 'testauthproject-2a6bd',
  storageBucket: 'testauthproject-2a6bd.appspot.com',
  messagingSenderId: '627185786898',
  appId: '1:627185786898:web:527831e6ce85e8108cf8cb',
  measurementId: 'G-WZ69SC3HQ8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const userName = document.querySelector('.js-modal-username');
const userEmail = document.querySelector('.js-modal-email');
const userPassword = document.querySelector('.js-modal-password');
const authForm = document.querySelector('.js-modal-form');
const signUpBtn = document.querySelector('.js-btn-sign-up');
const signInBtn = document.querySelector('.js-btn-sign-in');
const signOutBtn = document.querySelector('.js-log-out');
const modalBackdrop = document.querySelector('.backdrop');
const loggedUserContainer = document.querySelector('.logged-user');
const burgerMenu = document.querySelector('.burger-menu-container');
const burgerMenuLogOut = burgerMenu.querySelector('.burger-menu-btn-logout');
const headerNavWrapper = document.querySelector('.header-nav-wrapper');
const signUpBtnHeader = document.querySelector('.btn-outline-success');
const isLoggedIn = { logged: null };

authForm.addEventListener('submit', event => {
  event.preventDefault();
  event.currentTarget.reset();
});

signUpBtn.addEventListener('click', userSignUp);
signInBtn.addEventListener('click', userSignIn);
signOutBtn.addEventListener('click', userSignOut);
burgerMenuLogOut.addEventListener('click', userSignOut);

async function userSignUp() {
  const signUpName = userName.value;
  const signUpEmail = userEmail.value;
  const signUpPassword = userPassword.value;
  await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
    .then(userCredential => {
      const user = userCredential.user;
      set(ref(database, 'users/' + user.uid), {
        username: signUpName,
      });
    })
    .catch(error => {
      if (error.code === 'auth/email-already-exists') {
        Notiflix.Notify.failure(`Email address ${signUpEmail} already in use.`);
      } else if (error.code === 'auth/email-already-in-use') {
        Notiflix.Notify.failure(`Email address ${signUpEmail} already in use.`);
      } else {
        console.log(error.message);
      }
    });
}

async function userSignIn() {
  const usernameInput = userName.value;
  const signInEmail = userEmail.value;
  const signInPassword = userPassword.value;
  await signInWithEmailAndPassword(auth, signInEmail, signInPassword).catch(
    error => {
      if (error.code === 'auth/user-not-found') {
        Notiflix.Notify.failure(
          `User with this email address ${signInEmail} is not found.`
        );
      } else if (error.code === 'auth/wrong-password') {
        Notiflix.Notify.failure(`Wrong password. Please try again.`);
      } else {
        console.log(error.message);
      }
    }
  );
  window.location.reload();
}

function checkAuthState() {
  onAuthStateChanged(auth, user => {
    if (user) {
      const username = getUserName(user);
      loggedUserContainer.querySelector('.user-name').textContent = username;
      burgerMenu.querySelector('.burger-user-name').textContent = username;
      onLogged();
      isLoggedIn.logged = true;
    } else {
      onNotLogged();
      isLoggedIn.logged = false;
    }
  });
  return isLoggedIn.logged;
}

async function userSignOut() {
  await signOut(auth);
  window.location.reload();
}

function onLogged() {
  loggedUserContainer.classList.remove('logged-user-hidden');
  burgerMenu.querySelector('.user').classList.remove('logged-user-hidden');
  burgerMenuLogOut.classList.remove('logged-user-hidden');
  headerNavWrapper.classList.remove('logged-user-hidden');
  signUpBtnHeader.classList.add('logged-user-hidden');
  burgerMenu
    .querySelector('.burger-menu-signup-btn')
    .classList.add('logged-user-hidden');
}

function onNotLogged() {
  burgerMenu
    .querySelector('.burger-menu-signup-btn')
    .classList.remove('logged-user-hidden');
  burgerMenuLogOut.classList.add('logged-user-hidden');
  burgerMenu.querySelector('.user').classList.add('logged-user-hidden');
  loggedUserContainer.querySelector('.user-name').textContent = '';
  loggedUserContainer.classList.add('logged-user-hidden');
  headerNavWrapper.classList.add('logged-user-hidden');
  signUpBtnHeader.classList.remove('logged-user-hidden');
}

function getUserName(user) {
  let username;
  const userRef = ref(database, 'users/' + user.uid);
  onValue(userRef, snapshot => {
    username = snapshot.val().username;
    loggedUserContainer.querySelector('.user-name').textContent = username;
  });
  return username;
}

setTimeout(checkAuthState, 1000);
export { checkAuthState };
