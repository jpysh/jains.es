/**
 * Contact form submission.
 *
 * The form is real HTML with `required` attributes and works as a document
 * without this file; this only upgrades it to submit in place. If the
 * endpoint is unreachable or unconfigured, the visitor is pointed at the
 * WhatsApp and email routes rather than told a lie about delivery.
 */

const FALLBACK =
  'Something went wrong our end. Email helloayursen@gmail.com or message us on WhatsApp and it will reach the same person.';

export function initForm(form) {
  const msg = form.querySelector('.form-msg');
  const button = form.querySelector('button[type="submit"]');

  const setMsg = (text, kind) => {
    msg.textContent = text;
    msg.className = 'form-msg' + (kind ? ` is-${kind}` : '');
  };

  const markBad = (names) => {
    form.querySelectorAll('.field').forEach((f) => f.classList.remove('is-bad'));
    (names || []).forEach((n) => {
      const el = form.elements[n];
      el?.closest('.field')?.classList.add('is-bad');
    });
    const first = names && form.elements[names[0]];
    first?.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    // Check here as well as on the server: a round trip to be told a field is
    // empty is a worse experience than being told immediately.
    const missing = ['name', 'email', 'message'].filter((k) => !String(data[k] || '').trim());
    if (missing.length) {
      markBad(missing);
      setMsg('Name, email and a line about what is stuck, please.', 'bad');
      return;
    }

    button.disabled = true;
    setMsg('Sending…');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        form.reset();
        markBad([]);
        setMsg('Sent. You will get a reply from the person who would do the work.', 'ok');
        button.disabled = false;
        return;
      }

      markBad(body.fields);
      setMsg(body.fallback ? FALLBACK : body.error || FALLBACK, 'bad');
    } catch {
      setMsg(FALLBACK, 'bad');
    }
    button.disabled = false;
  });
}
