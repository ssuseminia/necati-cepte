# Necati Cepte v7.0 ❤️

Final toplu güncelleme.

## v7 özellikleri
- Tüm modüllere girişte ve önemli ekleme/silme/yayınlama işlemlerinde karşı tarafa OneSignal push.
- Nisa/Necati hesabına göre karşı tarafın özel mood sticker seti.
- Ruh hali değişikliğinde anlık push.
- Bizim Gökyüzümüz her gün 21:00 için otomatik güncellenir; Stellarium Web canlı gökyüzü + yerel astronomik harita.
- Anı Haritası: haritayı sürükle, tıkla veya işaretçiyi taşı; koordinat ve konum adı otomatik seçilir.
- Fotoğraf yükleme: Firebase Storage yoksa Firestore fotoğraf deposuna otomatik düşer.
- Hikâyemiz bölüm yayınlama: fotoğraf önizleme, yükleme durumu, hata mesajı ve çalışan yayınlama akışı.
- İyi Geceler: fotoğraf zorunlu; fotoğraf yoksa gönderim engellenir.
- Anı/Hikâye/İyi Geceler fotoğrafları iki hesap arasında senkron görüntülenebilir.

## Yayınlama
Bu klasördeki **tüm dosyaları** GitHub `necati-cepte` reposunun köküne yükle. Klasör yapısını koru (`assets/moods/...`).
Sonra bir kez `https://ssuseminia.github.io/necati-cepte/reset.html` aç.

## Cloudflare
Mevcut çalışan Cloudflare Worker ve OneSignal secretları değişmez. `cloudflare-worker/worker.js` v6 ile uyumludur ve generic title/body gönderdiği için v7 aktivitelerini de push olarak yollar.

## Not
Stellarium canlı görünümü üçüncü taraf web hizmetidir; yüklenmezse alttaki yerel astronomik yıldız haritası çalışmaya devam eder.
