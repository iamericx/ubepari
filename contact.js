(() => {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const nameInput = form.elements.namedItem('name');
  const phoneInput = form.elements.namedItem('phone');
  const interestInput = form.elements.namedItem('interest');
  const success = document.querySelector('#contact-success');
  const config = window.UBEPARI_CATALOGUE_CONFIG || {};
  const fields = [nameInput, phoneInput, interestInput];

  function setError(input, message) {
    const error = document.querySelector(`#${input.getAttribute('aria-describedby')}`);
    error.textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function validateField(input) {
    const value = input.value.trim();
    if (input === nameInput) {
      setError(input, value ? '' : 'Please enter your name.');
      return Boolean(value);
    }
    if (input === phoneInput) {
      const digits = value.replace(/\D/g, '');
      const validFormat = /^\+?[\d\s().-]+$/.test(value);
      const valid = validFormat && digits.length >= 7 && digits.length <= 15;
      setError(input, value && valid ? '' : 'Please enter a valid phone number.');
      return valid;
    }
    const valid = Boolean(value);
    setError(input, valid ? '' : "Please tell us what you're looking for.");
    return valid;
  }

  fields.forEach((input) => {
    input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (input.hasAttribute('aria-invalid')) validateField(input);
    });
    input.addEventListener('blur', () => {
      if (input.value.trim()) validateField(input);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    success.hidden = true;
    const invalid = fields.filter((input) => !validateField(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const data = new FormData(form);
    const lines = [
      'Hello UBEPARI PC,',
      '',
      `My name is ${String(data.get('name')).trim()}.`,
      `Phone: ${String(data.get('phone')).trim()}.`,
      '',
      `I'm looking for: ${String(data.get('interest')).trim()}`,
    ];
    const brand = String(data.get('brand') || '').trim();
    const budget = String(data.get('budget') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (brand) lines.push('', `Preferred brand: ${brand}`);
    if (budget) lines.push('', `Budget: ${budget}`);
    if (message) lines.push('', 'My requirements:', message);
    lines.push('', 'I found UBEPARI PC through your website and would like to know what options are available.');

    const phone = String(config.whatsappNumber || '').replace(/\D/g, '');
    if (!phone) {
      success.hidden = false;
      success.innerHTML = '<strong>WhatsApp contact is not configured.</strong><span>Please call UBEPARI PC using the contact details shown here.</span>';
      return;
    }

    const link = document.createElement('a');
    link.href = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    success.hidden = false;
  });
})();
