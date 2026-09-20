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

## v7.0.1 hotfix
- İyi Geceler fotoğraf yüklemesinde Firebase Storage tamamen devre dışı bırakıldı.
- Fotoğraflar güvenli boyuta küçültülüp Firestore `photos` koleksiyonunda tutuluyor.
- 15 saniyelik yükleme zaman aşımı eklendi.
- Gönderim sırasında aşamalar ayrı gösteriliyor.
- Push hatası artık mesajın kendisini göndermeyi bloke etmiyor.

## v7.0.2 hotfix
- Ayarlar bölümüne doğum tarihi geri eklendi.
- Son regl tarihi geri eklendi.
- Ortalama döngü süresi geri eklendi.
- Bu alanlar state içinde saklanır ve mevcut senkronizasyon akışına dahil olur.

## v8.0
- Ortak Takvim / Planlayıcı eklendi.
- Ortak Yapılacaklar listesi eklendi.
- Necati Bot (yerel, ücretsiz, şablon tabanlı) eklendi.
- Nisa ve Necati doğum günü ayarları eklendi.
- Regl başlangıç tarihi, regl süresi ve döngü süresi ayarları eklendi.
- Plan/görev ekleme, silme ve tamamlamada karşı tarafa OneSignal push gönderimi eklendi.
- Tüm yeni veriler mevcut `save()` senkronizasyon akışına dahil edildi.
