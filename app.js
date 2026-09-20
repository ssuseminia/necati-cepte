const relationshipStart = new Date('2025-04-12T00:00:00+03:00');
const $ = (id) => document.getElementById(id);

function updateCounter() {
  const now = new Date();
  let diff = Math.max(0, now - relationshipStart);
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const minutes = Math.floor(diff / 60000); diff %= 60000;
  const seconds = Math.floor(diff / 1000);
  $('days').textContent = days.toLocaleString('tr-TR');
  $('hours').textContent = hours;
  $('minutes').textContent = minutes;
  $('seconds').textContent = seconds;
}
updateCounter();
setInterval(updateCounter, 1000);

const messages = [
  ['Nisa’ya küçük bir hatırlatma', 'Bugün de seni seçiyorum. Yarın da öyle.'],
  ['Necati’den mesaj var 💌', 'Günün nasıl geçerse geçsin eve döndüğünde tarafın hep bende.'],
  ['Bugünün görevi', 'Bir adet sarılma borcun var. Faizi öpücük.'],
  ['Aşk kavanozundan', 'Seni seviyorum çünkü en sıradan günü bile benim için özel yapabiliyorsun.'],
  ['Mini sürpriz', 'Bugün sebepsiz yere seni sevdiğimi söylemek istedim. Sebep aramaya gerek yok.']
];
let messageIndex = 0;
$('newMessageBtn').addEventListener('click', () => {
  messageIndex = (messageIndex + 1) % messages.length;
  $('dailyTitle').textContent = messages[messageIndex][0];
  $('dailyMessage').textContent = messages[messageIndex][1];
});

const dialog = $('moduleDialog');
const moduleCopy = {
  'Nisa Modu': ['🌸', 'Nisa Modu', 'Ruh hali seçimi, dönem takibi ve Necati’ye özel mizahi tavsiyeler burada olacak.'],
  'Sürpriz Takvimi': ['🎁', 'Sürpriz Takvimi', 'Her gün yalnızca o güne ait kutunun açıldığı mesaj, görev ve sürpriz alanı.'],
  'Aşk Kavanozu': ['🫙', 'Aşk Kavanozu', 'Her girişte yeni bir “Seni seviyorum çünkü...” kartı açılacak.'],
  'Anı Haritası': ['📍', 'Anı Haritası', 'Birlikte gittiğiniz özel yerleri fotoğraf ve notlarla haritada göstereceğiz.'],
  'Bizim Gökyüzümüz': ['✨', 'Bizim Gökyüzümüz', 'Seçtiğiniz özel tarih ve konum için yıldız haritası burada yer alacak.'],
  'Hikâyemiz': ['🎬', 'Hikâyemiz', 'İlişkinizi dijital dizi gibi sezon ve bölümlere ayıracağız.'],
  'Özel Günler': ['💍', 'Özel Günler', 'Yıldönümü, nişan ve sizin için önemli tarihlere geri sayım.'],
  'İyi Geceler': ['🌙', 'İyi Geceler Arşivi', 'Nisa’ya yazdığın iyi geceler mesajlarını tarih tarih saklayabileceğiz.'],
  'Acil Necati': ['🚨', 'Acil Necati', 'Tatlı, sarılma, ilgi veya “beni ara” gibi hızlı çağrı düğmeleri ekleyeceğiz.'],
  'Doğduğun Gün': ['🎂', 'Doğduğun Gün', 'Nisa’nın doğum tarihi girildiğinde eğlenceli yaşam istatistikleri hesaplanacak.']
};

document.querySelectorAll('.module-card').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = moduleCopy[btn.dataset.module];
    $('dialogIcon').textContent = item[0];
    $('dialogTitle').textContent = item[1];
    $('dialogText').textContent = item[2];
    dialog.showModal();
  });
});
['closeDialog','dialogOk'].forEach(id => $(id).addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

let deferredPrompt;
const installBtn = $('installBtn');
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
