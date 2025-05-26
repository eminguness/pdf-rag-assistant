document.addEventListener('DOMContentLoaded', function () {
  // Şifre göster/gizle fonksiyonu
  const passwordToggles = document.querySelectorAll('.password-toggle');

  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
      const passwordInput = this.previousElementSibling;
      const isPassword = passwordInput.type === 'password';

      passwordInput.type = isPassword ? 'text' : 'password';
      this.classList.toggle('fa-eye-slash');
      this.classList.toggle('fa-eye');
    });
  });

  // Caps Lock uyarısı
  const passwordInputs = document.querySelectorAll('input[type="password"]');

  passwordInputs.forEach(input => {
    const warning = document.createElement('div');
    warning.className = 'caps-lock-warning';
    warning.style.color = '#ff4d4f';
    warning.style.fontSize = '13px';
    warning.style.marginTop = '5px';
    warning.style.display = 'none';
    warning.innerText = 'Caps Lock açık!';
    input.parentNode.appendChild(warning);

    input.addEventListener('keyup', function (e) {
      warning.style.display = e.getModifierState('CapsLock') ? 'block' : 'none';
    });

    input.addEventListener('keydown', function (e) {
      warning.style.display = e.getModifierState('CapsLock') ? 'block' : 'none';
    });

    input.addEventListener('blur', function () {
      warning.style.display = 'none'; // Odak dışına çıkınca uyarıyı gizle
    });
  });

  // Form gönderim kontrolü
  const registerForm = document.getElementById('register-form');

  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      // Basit validasyon
      if (password !== confirmPassword) {
        alert('Şifreler eşleşmiyor!');
        return;
      }

      if (password.length < 6) {
        alert('Şifre en az 6 karakter olmalıdır!');
        return;
      }

      console.log('Kayıt bilgileri:', { username, email, password });

      alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      // window.location.href = '/login';
    });
  }
});
