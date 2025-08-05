/**
* PHP Email Form Validation - v3.9
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => {
      if( response.ok ) {
        return response.text();
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      if (data.trim() == 'OK') {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset(); 
      } else {
        throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action); 
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCLwqATspz6NOUiQsLew-IeQkqgZc7p6c4",
  authDomain: "sign-up-bdf27.firebaseapp.com",
  projectId: "sign-up-bdf27",
  storageBucket: "sign-up-bdf27.appspot.com",
  messagingSenderId: "894618638610",
  appId: "1:894618638610:web:d66d7ea68da8090df7bbcb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Run after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  const emailInput = form.querySelector('input[name="email"]');
  const loading = form.querySelector('.loading');
  const errorMessage = form.querySelector('.error-message');
  const sentMessage = form.querySelector('.sent-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset messages
    loading.style.display = 'block';
    errorMessage.style.display = 'none';
    sentMessage.style.display = 'none';

    try {
      const email = emailInput.value.trim().toLowerCase();
      if (!email) throw new Error("Email is required.");
      if (!validateEmail(email)) throw new Error("Please enter a valid email.");

      // 🔎 Check for duplicates
      const q = query(collection(db, "newsletter_subscribers"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) throw new Error("You're already subscribed!");

      // ✅ Add to Firestore
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email,
        subscribedAt: new Date()
      });

      loading.style.display = 'none';
      sentMessage.style.display = 'block';
      form.reset();
    } catch (err) {
      loading.style.display = 'none';
      errorMessage.textContent = err.message;
      errorMessage.style.display = 'block';
    }
  });
});

// ✅ Simple email format validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
