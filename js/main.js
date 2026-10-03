const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

const closeMenu = () => {
  nav?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation menu');
};

menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const form = document.querySelector('[data-contact-form]');
const requiredFields = ['name', 'phone', 'email', 'job_details'];

const showFieldError = (field, message) => {
  const row = field.closest('.form-row');
  row.classList.toggle('has-error', Boolean(message));
  row.querySelector('.field-error').textContent = message;
};

const submitToFormspree = async (submittedForm) => {
  const button = submittedForm.querySelector('button[type="submit"]');
  const errorMessage = submittedForm.querySelector('[data-submit-error]');
  const successMessage = submittedForm.nextElementSibling;
  const buttonText = button.textContent;

  errorMessage.hidden = true;
  button.disabled = true;
  button.textContent = 'Sending…';
  submittedForm.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(submittedForm.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(new FormData(submittedForm).entries()))
    });

    if (!response.ok) throw new Error('Form submission failed');

    submittedForm.hidden = true;
    successMessage.hidden = false;
    successMessage.focus();
  } catch {
    errorMessage.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = buttonText;
    submittedForm.removeAttribute('aria-busy');
  }
};

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  let isValid = true;

  requiredFields.forEach((name) => {
    const field = form.elements[name];
    let error = '';
    if (!field.value.trim()) error = 'Please enter this detail.';
    if (name === 'email' && field.value.trim() && !field.validity.valid) error = 'Please enter a valid email.';
    if (name === 'phone' && field.value.replace(/\D/g, '').length < 8) error = 'Please enter a valid phone number.';
    showFieldError(field, error);
    if (error && isValid) field.focus();
    if (error) isValid = false;
  });

  if (isValid) await submitToFormspree(form);
});

form?.querySelectorAll('input:not([type="hidden"]), textarea').forEach((field) => {
  field.addEventListener('input', () => showFieldError(field, ''));
});

const quoteForm = document.querySelector('[data-quote-form]');
quoteForm?.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach((field) => {
  field.addEventListener('input', () => {
    field.closest('.quote-field').classList.remove('has-error');
    field.closest('.quote-field').querySelector('.field-error').textContent = '';
  });
});

quoteForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fields = [...quoteForm.querySelectorAll('input[required], textarea[required], select[required]')];
  let isValid = true;

  fields.forEach((field) => {
    let error = '';
    if (!field.value.trim()) error = 'Please enter this detail.';
    if (field.type === 'email' && field.value.trim() && !field.validity.valid) error = 'Please enter a valid email.';
    if (field.name === 'phone' && field.value.replace(/\D/g, '').length < 8) error = 'Please enter a valid phone number.';
    const row = field.closest('.quote-field');
    row.classList.toggle('has-error', Boolean(error));
    row.querySelector('.field-error').textContent = error;
    if (error && isValid) field.focus();
    if (error) isValid = false;
  });

  if (isValid) await submitToFormspree(quoteForm);
});

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());
