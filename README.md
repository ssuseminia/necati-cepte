# Necati Cepte ❤️

Nisa & Necati için kurulabilir PWA.

## Çalışan modüller
- İlişki sayacı
- Nisa Modu: ruh hali + yaklaşık döngü takibi
- Sürpriz Takvimi: tarihi gelene kadar kilitli kutular
- Aşk Kavanozu: günlük kart + özel kart ekleme
- Anı Haritası: OpenStreetMap üzerinde konum, not, fotoğraf
- Bizim Gökyüzümüz: seçili parlak yıldızların tarih/konuma göre gerçek konum hesabı
- Hikâyemiz: sezon/bölüm yapısı ve fotoğraf
- Özel Günler: geri sayım
- İyi Geceler arşivi
- Acil Necati: telefon paylaşım menüsüne çağrı mesajı gönderme
- Doğduğun Gün: yaşam istatistikleri
- Ayarlar + JSON yedekleme/geri yükleme

## Yayınlama
GitHub Pages'te repo kök dizininden yayınlayın. Değişikliklerden sonra tarayıcı eski sürümü gösterirse sayfayı bir kez yenileyin; service worker v2.1 eski cache'i temizler.

## Veri saklama
Kullanıcı verileri cihazdaki localStorage içinde tutulur; GitHub'a veya başka bir sunucuya otomatik gönderilmez. Harita döşemeleri ve Leaflet dosyaları internetten yüklenir.
