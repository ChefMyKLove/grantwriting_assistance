// js/intake-form.js
const form = document.getElementById('intakeForm');
const status = document.getElementById('intakeStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: form.elements.name.value,
    email: form.elements.email.value,
    grant_type: form.elements.grant_type.value,
    project_description: form.elements.project_description.value
  };

  status.hidden = false;
  status.textContent = 'Sending…';

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      status.textContent = "Thanks, I'll be in touch soon.";
      form.reset();
    } else {
      status.textContent = (data && data.error) || 'Something went wrong. Please try again or email me directly.';
    }
  } catch (err) {
    status.textContent = "Something didn't send. Email grants@chefmyklove.com directly and I'll get it.";
  }
});
