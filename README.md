# Necati Cepte v4.1

Düzeltmeler:
- Anı kaydı artık yalnızca başlık ile yapılabilir; konum isteğe bağlıdır.
- Firebase Storage kapalıysa fotoğraf yüzünden kayıt engellenmez; anı fotoğrafsız kaydedilir.
- Harita yalnızca koordinatı bulunan anıları işaretler.
- Acil Necati çağrısı uygulama açıkken tam ekran uyarı + titreşim + sistem bildirimi üretir.
- Mobil tarayıcı canlı bağlantıyı uyutursa 20 saniyelik yedek bildirim kontrolü vardır.
- Service worker cache v4.1'e yükseltildi.


## v5.2 düzeltmesi
- cloud.js sözdizimi hatası düzeltildi; hesap/giriş butonu tekrar çalışır.
- Acil Necati başarısız olduğunda sistem paylaşım menüsü artık açılmaz.
- Bulut girişi yoksa kullanıcıya giriş yapması söylenir.


## v5.3
- Cache-first yerine uygulama kodlarında network-first.
- Hesap butonuna doğrudan fallback eklendi.
- Sistem testi butonu eklendi.
- Service worker güncellemesi zorlanıyor.
