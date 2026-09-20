# Necati Cepte ❤️ ) Tamamen Necati tarafından hazırlanmıştır.

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

## v8.0.1 hotfix
- Ortak Takvim, Yapılacaklar ve Necati'yi Ara kartları doğru Modüller alanına taşındı.
- data-open kartları artık gerçek dialog açıyor.
- Boş sayfa/yanlış header yerleşimi düzeltildi.
- Hesap butonundaki bozuk inline onclick kaldırıldı.

## v8.0.2 hotfix
- Modüle yalnızca girildiğinde gönderilen push bildirimleri kaldırıldı.
- Bildirimler artık gerçek kullanıcı işlemlerinde kalır: ruh hali değişimi, sürpriz/kavanoz/anı/bölüm/özel gün/iyi geceler/plan/görev ekleme, Acil Necati çağrısı vb.
- Ortak Takvim ve Yapılacaklar ekranına sadece giriş yapmak artık bildirim üretmez.

## v9.0
- Ortak Takvim baştan düzenlendi: aylık görünüm, seçili gün, düzenleme, silme, sahip, kategori, saat, not, hatırlatma.
- Yapılacaklar baştan düzenlendi: filtre, düzenleme, silme, tamamlama, öncelik, sahip, son tarih, takvimde gösterme.
- Ortak Harcama Takibi eklendi: aylık toplam, Necati/Nisa ödemeleri, kategori, takvim entegrasyonu.
- Necati Bot 2.0 uygulama verilerinden bugünkü planı, açık görevleri ve aylık harcama toplamını okuyabilir.
- Akıllı bildirimler için plan/görev reminder metadata alanları eklendi.
