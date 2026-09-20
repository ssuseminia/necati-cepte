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

## v10.0 Mobile Redesign
- Ana arayüz mobil uygulama mantığına taşındı.
- Sabit 5 sekmeli alt navigasyon: Ana Sayfa / Takvim / Biz / Planlar / Profil.
- Ana sayfaya canlı gün özeti eklendi: ruh hali, sıradaki plan, açık görev, aylık harcama.
- Hızlı erişim şeridi eklendi.
- Modüller mobil uygulama kartlarına dönüştürüldü.
- Takvim, görev, harcama, bot ve ayarlar mobilde tam ekran sayfa gibi açılır.
- Ana modül ekranları da mobil full-screen geçiş görünümünde.
- Scriptler dialoglardan sonra yüklenir; v9'daki zamanlama/null listener riskleri azaltıldı.
- iPhone safe-area destekli üst ve alt barlar eklendi.

## v10.0.1 Critical interaction fix
- v10 mobil header sırasında kaldırılan `coupleBadge` nedeniyle oluşan başlangıç JavaScript hatası düzeltildi.
- Takvim plan kaydetme tekrar aktif.
- Yapılacaklar görev ekleme/düzenleme tekrar aktif.
- Ortak Harcamalar kayıt ekleme tekrar aktif.
- Necati Bot gönder butonu tekrar aktif.
- Mobil `[data-module]` kartları gerçek modül açma sistemine bağlandı.
- Modüle yalnızca girildiğinde gönderilen push bildirimi kaldırıldı.
- Ana kayıt butonlarına mobil PWA/cache durumları için event-delegation güvenlik katmanı eklendi.


## v10.1
- Uygulama ikonları kullanıcı tarafından verilen çizimlerle değiştirildi.
- Mobil görünüm daha da uygulama benzeri hale getirildi; geniş ekranda sabit telefon görünümü korundu.
- “Gökyüzümüz” modülü ana arayüzden kaldırıldı.
- “Bugün ne var?” kartı zenginleştirildi: yaklaşan akış, akıllı chip özetleri, özel gün/doğum günü/regl bilgileri.
- Gerçek zamanlı akıllı hatırlatma altyapısı eklendi:
  - planlar için seçili hatırlatma zamanında
  - görevler için seçili hatırlatma zamanında
  - özel günler için 7 gün / 1 gün / bugün
  - doğum günü için 7 gün / 1 gün / bugün
  - regl için 1 gün önce / bugün
- Yerel bildirim izni varsa service worker üzerinden bildirim gösterir, yoksa en azından uygulama içinde toast gösterir.

## v10.2
- Akıllı bildirimlere saat bazlı kategori sistemi:
  - görev, özel gün, doğum günü, regl ve harcama özeti için ayrı saat
  - sessiz saat aralığı
  - planlar kendi saatine ve seçili hatırlatma süresine göre çalışır
- Ortak Harcamalara aylık kategori grafiği eklendi.
- Takvimde Date / Aile / İş / Sağlık / Ödeme / Görev renk kodları eklendi.
- Necati Bot 2.0 daha doğal ve bağlamsal hale getirildi:
  - bugünkü/yarınki planları
  - görevleri
  - harcama ve kategori toplamlarını
  - son ruh halini okuyabilir
  - kendisinin bot olduğunu açıkça belirtir.

## v10.3
- 🎲 Date Çarkı eklendi.
  - 10 farklı date fikri
  - gerçek dönen çark animasyonu
  - çıkan fikri tek tuşla Ortak Takvim'e ekleme
- 🏠 Hızlı Durum eklendi.
  - Eve geldim
  - Yoldayım
  - Çıktım
  - Seni arayacağım
  - seçildiğinde karşı tarafa push bildirim gönderir
- 🎁 Rastgele Sürpriz Modu eklendi.
  - 12 farklı mini ilişki görevi
  - art arda aynı görevi seçmez
  - “Bunu yapacağım” ile kabul edilir
  - kabul edilince karşı tarafa tatlı bildirim gider
  - aylık kabul edilen görev sayısını gösterir

## v10.3.1 sadeleştirme
- Aşk Kavanozu modülü arayüzden kaldırıldı.
- Doğduğun Gün modülü arayüzden kaldırıldı.
- Hızlı erişimdeki Aşk Kavanozu butonu kaldırıldı.
- Eski kayıtlar silinmez; sadece artık uygulama arayüzünde gösterilmez.
