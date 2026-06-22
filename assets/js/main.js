document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.header__menu-btn');
  const drawer = document.querySelector('.header__drawer');

  if (menuBtn && drawer) {
    const closeDrawer = () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      drawer.hidden = true;
      menuBtn.setAttribute('aria-label', 'メニューを開く');
    };

    const openDrawer = () => {
      menuBtn.setAttribute('aria-expanded', 'true');
      drawer.classList.add('is-open');
      drawer.hidden = false;
      menuBtn.setAttribute('aria-label', 'メニューを閉じる');
    };

    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeDrawer();
      }
    });
  }
  const voiceSliderEl = document.querySelector('.voice__slider');

  if (voiceSliderEl && typeof Swiper !== 'undefined') {
    const wrapper = voiceSliderEl.querySelector('.swiper-wrapper');
    const originalSlides = wrapper
      ? Array.from(wrapper.querySelectorAll(':scope > .swiper-slide'))
      : [];

    if (wrapper && originalSlides.length > 0) {
      const spaceBetween = window.innerWidth <= 768 ? 24 : 28;
      const slideWidth = originalSlides[0].getBoundingClientRect().width || 448;
      const visibleSlides = Math.ceil(window.innerWidth / Math.max(slideWidth + spaceBetween, 1));
      const minSlides = Math.max(originalSlides.length * 2, visibleSlides * 2 + originalSlides.length);

      let cloneIndex = 0;
      while (wrapper.children.length < minSlides) {
        const clone = originalSlides[cloneIndex % originalSlides.length].cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        wrapper.appendChild(clone);
        cloneIndex += 1;
      }
    }

    new Swiper(voiceSliderEl, {
      loop: true,
      slidesPerView: 'auto',
      speed: 12000,
      allowTouchMove: false,
      loopAdditionalSlides: originalSlides.length,
      spaceBetween: 28,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      breakpoints: {
        320: {
          spaceBetween: 24,
        },
        769: {
          spaceBetween: 28,
        },
      },
    });
  }

  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) => {
    const button = item.querySelector('.faq__question');
    if (!button) return;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach((faqItem) => {
        faqItem.classList.remove('is-open');
        const faqButton = faqItem.querySelector('.faq__question');
        if (faqButton) {
          faqButton.setAttribute('aria-expanded', 'false');
        }
      });

      if (!isOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const selectWrap = document.querySelector('.application__select-wrap');
  if (selectWrap) {
    const trigger = selectWrap.querySelector('.application__select-trigger');
    const selectedText = selectWrap.querySelector('.application__select-text');
    const options = selectWrap.querySelectorAll('.application__select-option');
    const hiddenInput = selectWrap.querySelector('#issue');
    const optionsList = selectWrap.querySelector('.application__select-options');

    if (trigger && selectedText && hiddenInput && optionsList && options.length > 0) {
      const closeSelect = () => {
        selectWrap.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        optionsList.hidden = true;
      };

      const openSelect = () => {
        selectWrap.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        optionsList.hidden = false;
      };

      trigger.addEventListener('click', () => {
        const isOpen = selectWrap.classList.contains('is-open');
        if (isOpen) {
          closeSelect();
        } else {
          openSelect();
        }
      });

      options.forEach((option) => {
        option.addEventListener('click', () => {
          const value = option.dataset.value || '';
          selectedText.textContent = option.textContent || '';
          hiddenInput.value = value;
          options.forEach((item) => {
            item.classList.remove('is-selected');
            item.setAttribute('aria-selected', 'false');
          });
          option.classList.add('is-selected');
          option.setAttribute('aria-selected', 'true');
          closeSelect();
        });
      });

      document.addEventListener('click', (event) => {
        if (!selectWrap.contains(event.target)) {
          closeSelect();
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeSelect();
        }
      });
    }
  }

  const applicationForm = document.querySelector('.application__form');
  if (applicationForm) {
    const resultEl = applicationForm.querySelector('.application__result');
    const submitBtn = applicationForm.querySelector('.application__submit');

    const showResult = (message, isError) => {
      if (!resultEl) return;
      resultEl.textContent = message;
      resultEl.className = 'application__result' + (isError ? ' is-error' : ' is-success');
      resultEl.hidden = false;
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const validateForm = () => {
      const required = [
        { id: 'company', label: '企業名' },
        { id: 'name', label: 'お名前' },
        { id: 'email', label: 'メールアドレス' },
        { id: 'issue', label: '現在のお悩み' },
      ];
      for (const field of required) {
        const el = applicationForm.querySelector('#' + field.id);
        if (!el || !el.value.trim()) {
          return field.label + 'を入力・選択してください。';
        }
      }
      const email = applicationForm.querySelector('#email');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        return 'メールアドレスの形式が正しくありません。';
      }
      return null;
    };

    applicationForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const error = validateForm();
      if (error) {
        showResult(error, true);
        return;
      }

      submitBtn.disabled = true;
      if (resultEl) resultEl.hidden = true;

      try {
        const formData = new FormData(applicationForm);
        const response = await fetch(applicationForm.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          showResult('お問い合わせを受け付けました。担当者よりご連絡いたします。', false);
          applicationForm.reset();
          const selectText = applicationForm.querySelector('.application__select-text');
          if (selectText) selectText.textContent = '選択してください';
          const hiddenIssue = applicationForm.querySelector('#issue');
          if (hiddenIssue) hiddenIssue.value = '';
          const selectOptions = applicationForm.querySelectorAll('.application__select-option');
          selectOptions.forEach((opt, i) => {
            opt.classList.toggle('is-selected', i === 0);
            opt.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
          });
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = (data.errors && data.errors[0] && data.errors[0].message) || '送信に失敗しました。時間をおいて再度お試しください。';
          showResult(msg, true);
        }
      } catch {
        showResult('通信エラーが発生しました。インターネット接続をご確認ください。', true);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  const inquirySection = document.querySelector('.inquiry');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initScrollReveal = (selector, visibleClass = 'is-visible') => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add(visibleClass));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(visibleClass);
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    elements.forEach((element) => observer.observe(element));
  };

  if (inquirySection) {
    initScrollReveal('.inquiry', 'is-animated');
  }

  const header = document.querySelector('.header');

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const top = hash === '#top'
        ? 0
        : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight);

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });

      history.pushState(null, '', hash);
    });
  });

  const floatingCta = document.querySelector('.floating-cta');
  const conceptSection = document.querySelector('#concept');
  const footer = document.querySelector('#footer');

  if (floatingCta && conceptSection && footer) {
    const updateFloatingCta = () => {
      const conceptTop = conceptSection.getBoundingClientRect().top;
      const footerTop = footer.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;
      const isConceptVisible = conceptTop < viewportHeight * 0.75;
      const isBeforeFooter = footerTop > viewportHeight;

      floatingCta.classList.toggle('is-visible', isConceptVisible && isBeforeFooter);
    };

    updateFloatingCta();
    window.addEventListener('scroll', updateFloatingCta, { passive: true });
    window.addEventListener('resize', updateFloatingCta);
  }

  const heroContent = document.querySelector('.hero .fade-up');
  if (heroContent) {
    if (prefersReducedMotion) {
      heroContent.classList.add('is-visible');
    } else {
      window.setTimeout(() => heroContent.classList.add('is-visible'), 120);
    }
  }

  initScrollReveal('.heading-line, .highlight-line');
  initScrollReveal('.stagger-pop');
  initScrollReveal('.fade-up, .fade-up--self');
});
