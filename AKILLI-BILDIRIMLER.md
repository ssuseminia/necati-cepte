# Akıllı Bildirimler

v9.0 ile plan ve görev kayıtlarında hatırlatma tercihi tutulur:
- Plan: 1 saat / 3 saat / 1 gün önce
- Görev: 1 gün / 2 gün önce
- Doğum günü ve regl ayarları mevcut ayarlardan okunabilir.

Not: Uygulama tamamen kapalıyken zaman bazlı otomatik bildirim göndermek için Cloudflare Worker'a Scheduled Trigger (Cron) eklenmesi gerekir.
Bu paket veri modelini hazırlar; mevcut Acil Necati / OneSignal push sistemi bozulmaz.
