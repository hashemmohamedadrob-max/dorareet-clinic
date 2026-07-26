// script.js
// يرسل بيانات نموذج الحجز إلى السيرفر عبر API

document.getElementById('booking-form').addEventListener('submit', async function (e) {
  e.preventDefault(); // يمنع إعادة تحميل الصفحة

  const messageBox = document.getElementById('form-message');

  const bookingData = {
    patientName: document.getElementById('patient-name').value,
    phone: document.getElementById('phone').value,
    doctor: document.getElementById('doctor').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    notes: document.getElementById('notes').value
  };

  try {
    const response = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();

    messageBox.textContent = result.message;
    messageBox.className = result.success ? 'form-message success' : 'form-message error';

    if (result.success) {
      document.getElementById('booking-form').reset();
    }
  } catch (err) {
    messageBox.textContent = 'حدث خطأ في الاتصال بالسيرفر. تأكد أن السيرفر يعمل.';
    messageBox.className = 'form-message error';
    console.error(err);
  }
});