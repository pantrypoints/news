---
title: "About and Contact"
subtitle: "Get to the Point!"
description: "About Pointer News"
image: /logo.png
hero_video: /vid.mp4
date: 2026-01-01
---


## About Pointer News

Pointer News is a project by PDMSI, a media association in the Philippines, with technical assitance by Pantrypoints Technologies.


<section class="py-20 bg-sp-bg">
  <div class="max-w-2xl mx-auto px-4">
    <h1 class="font-display text-4xl font-bold text-center text-sp-text mb-8">Contact Us</h1>
    <div class="bg-sp-card rounded-2xl border border-sp-border p-6">
      <div id="successMsg" class="hidden text-center py-8">
        <p class="text-teal-600 font-semibold">✓ Message sent successfully!</p>
      </div>
      <form id="contactForm" action="https://usebasin.com/f/fe409f5e1e78" method="POST" class="space-y-5">
        <input type="hidden" name="_redirect" value="false">
        <input type="text" name="_gotcha" style="display:none">
        <input type="text" name="name" placeholder="Your name" required
               class="w-full px-4 py-3 rounded-xl bg-sp-bg border border-sp-border focus:ring-2 focus:ring-teal-500">
        <input type="email" name="email" placeholder="Email address" required class="w-full px-4 py-3 rounded-xl bg-sp-bg border border-sp-border focus:ring-2 focus:ring-teal-500">
        <textarea name="message" rows="5" placeholder="Your message" required
                  class="w-full px-4 py-3 rounded-xl bg-sp-bg border border-sp-border focus:ring-2 focus:ring-teal-500"></textarea>
        <button type="submit" 
                class="w-full py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-semibold rounded-xl
                       hover:from-orange-400 hover:to-yellow-400 transition-all">
          Send Message
        </button>
      </form>
    </div>
  </div>
</section>


<script>
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending...';
  
  try {
    const res = await fetch(this.action, {
      method: 'POST',
      body: new FormData(this),
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.ok) {
      this.style.display = 'none';
      document.getElementById('successMsg').classList.remove('hidden');
    } else {
      alert('Error sending message. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  } catch {
    alert('Network error. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Send Message';
  }
});
</script>
