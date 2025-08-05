(function () {
  "use strict";

  /**
   * Faster Preloader Removal (DOMContentLoaded)
   */
  document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('#preloader');
    if (preloader) preloader.remove();
  });

  /**
   * Apply .scrolled class to body on scroll
   */
  function toggleScrolled() {
    const body = document.querySelector('body');
    const header = document.querySelector('#header');
    if (!header.classList.contains('scroll-up-sticky') &&
        !header.classList.contains('sticky-top') &&
        !header.classList.contains('fixed-top')) return;

    window.scrollY > 100 ? body.classList.add('scrolled') : body.classList.remove('scrolled');
  }
  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  function mobileNavToggle() {
    document.body.classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navLink => {
    navLink.addEventListener('click', () => {
      if (document.body.classList.contains('mobile-nav-active')) {
        mobileNavToggle();
      }
    });
  });

  /**
   * Mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');
  function toggleScrollTop() {
    if (!scrollTop) return;
    window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animate on scroll (AOS)
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * GLightbox init
   */
  const glightbox = GLightbox({ selector: '.glightbox' });

  /**
   * Swiper sliders init
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(swiperElement => {
      let config = JSON.parse(swiperElement.querySelector(".swiper-config").innerHTML.trim());
      swiperElement.classList.contains("swiper-tab")
        ? initSwiperWithCustomPagination(swiperElement, config)
        : new Swiper(swiperElement, config);
    });
  }
  window.addEventListener("load", initSwiper);

  /**
   * Isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(isotopeItem => {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), () => {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(filterBtn => {
      filterBtn.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({ filter: this.getAttribute('data-filter') });
        if (typeof aosInit === 'function') aosInit();
      });
    });
  });

  /**
   * FAQ toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach(faq => {
    faq.addEventListener('click', () => {
      faq.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Scroll to hash with offset fix
   */
  window.addEventListener('load', () => {
    if (window.location.hash && document.querySelector(window.location.hash)) {
      setTimeout(() => {
        const section = document.querySelector(window.location.hash);
        const offset = parseInt(getComputedStyle(section).scrollMarginTop);
        window.scrollTo({ top: section.offsetTop - offset, behavior: 'smooth' });
      }, 100);
    }
  });

  /**
   * Navmenu scrollspy
   */
  const navLinks = document.querySelectorAll('.navmenu a');
  function navScrollspy() {
    const position = window.scrollY + 200;
    navLinks.forEach(link => {
      if (!link.hash || !document.querySelector(link.hash)) return;
      const section = document.querySelector(link.hash);
      const inView = position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight;
      link.classList.toggle('active', inView);
    });
  }
  window.addEventListener('load', navScrollspy);
  document.addEventListener('scroll', navScrollspy);

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
