

(function () {
  'use strict';

  
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return document.querySelectorAll(sel); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


 
  function animateName() {
    var el = $('#heroName');
    if (!el) return;

    var name = el.dataset.name || el.textContent.trim();
    el.textContent = ''; 

    if (reduced) {
      el.textContent = name;
      el.style.opacity = '1';
      return;
    }

    var baseDelay = 0.5; 

    name.split('').forEach(function (char, i) {
      var span = document.createElement('span');

      if (char === ' ') {
        span.className = 'letter-space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'letter';
        span.textContent = char;
        
        span.style.animationDelay = (baseDelay + i * 0.055) + 's';
      }

      el.appendChild(span);
    });
  }



  var roleWords = [
    'Python.',
    'Machine Learning.',
    'Deep Learning.',
    'Flask & Streamlit.',
    'the Cloud.'
  ];

  function startTypewriter() {
    var el = $('#roleType');
    if (!el) return;

    if (reduced) {
      el.textContent = roleWords[0];
      return;
    }

    var wIndex = 0;
    var charPos = 0;
    var deleting = false;
    var pauseEnd = 0;
    var pausing = false;

    function tick() {
      var word = roleWords[wIndex];
      var now = Date.now();

      if (pausing) {
        if (now < pauseEnd) {
          setTimeout(tick, 60);
          return;
        }
        pausing = false;
        deleting = true;
      }

      if (!deleting) {

        charPos++;
        el.textContent = word.slice(0, charPos);

        if (charPos === word.length) {
          
          pausing = true;
          pauseEnd = now + 1600;
          setTimeout(tick, 60);
          return;
        }
        setTimeout(tick, 110);
      } else {
        
        charPos--;
        el.textContent = word.slice(0, charPos);

        if (charPos === 0) {
          deleting = false;
          wIndex = (wIndex + 1) % roleWords.length;
          setTimeout(tick, 280);
          return;
        }
        setTimeout(tick, 65);
      }
    }

  
    setTimeout(tick, 1800);
  }


 
  function setupNav() {
    var navbar = $('#navbar');
    var burger = $('#burger');
    var navLinks = $('#navLinks');
    var links = $$('.nl');

    
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        navbar.style.background = 'rgba(11,15,26,0.96)';
      } else {
        navbar.style.background = 'rgba(11,15,26,0.85)';
      }
    }, { passive: true });

    
    if (burger && navLinks) {
      burger.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('open');
        burger.classList.toggle('open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
      });

      
      navLinks.addEventListener('click', function (e) {
        if (e.target.classList.contains('nl')) {
          navLinks.classList.remove('open');
          burger.classList.remove('open');
        }
      });

     
      document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target)) {
          navLinks.classList.remove('open');
          burger.classList.remove('open');
        }
      });
    }

   
    var sections = $$('section[id]');
    if (!sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (a) {
          var matches = a.getAttribute('href') === '#' + id;
          a.classList.toggle('active', matches);
        });
      });
    }, { threshold: 0.45 });

    sections.forEach(function (s) { io.observe(s); });
  }



  function setupReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (reduced) {
      items.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // only animate once
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }


 
  function setupCounters() {
    var nums = $$('.stat-num[data-target]');
    if (!nums.length || reduced) {
      nums.forEach(function (el) {
        el.textContent = el.dataset.target;
      });
      return;
    }

    var done = false;

    var io = new IntersectionObserver(function (entries) {
      if (done) return;
      if (!entries[0].isIntersecting) return;
      done = true;

      nums.forEach(function (el) {
        var target = parseInt(el.dataset.target, 10);
        var start = 0;
        var duration = 1200;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
        
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(step);
      });

      io.disconnect();
    }, { threshold: 0.5 });

    var aboutSection = $('#about');
    if (aboutSection) io.observe(aboutSection);
  }


  function setupRipple() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn');
      if (!btn) return;

      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = [
        'width:' + size + 'px',
        'height:' + size + 'px',
        'left:' + (e.clientX - rect.left - size / 2) + 'px',
        'top:' + (e.clientY - rect.top - size / 2) + 'px'
      ].join(';');

      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  }



  function setupForm() {
    var form = $('#contactForm');
    if (!form) return;

    var btn = $('#sendBtn');
    var note = $('#formNote');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();

 
      if (!name || !email || !message) {
        note.style.color = '#f87171';
        note.textContent = 'Please fill in all fields.';
        return;
      }

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        note.style.color = '#f87171';
        note.textContent = 'That email address doesn\'t look right.';
        return;
      }

     
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(function () {
        note.style.color = '';
        note.textContent = '✓  Thanks! I\'ll get back to you soon.';
        form.reset();
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 1200);
    });
  }



  document.addEventListener('DOMContentLoaded', function () {
    animateName();
    startTypewriter();
    setupNav();
    setupReveal();
    setupCounters();
    setupRipple();
    setupForm();
  });

}());