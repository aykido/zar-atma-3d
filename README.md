# 3D Zar Atma Projesi

Three.js kütüphanesi kullanılarak hazırlanmış, tarayıcı tabanlı interaktif bir 3D zar atma uygulaması.

## Özellikler

- **3D Görselleştirme:** Three.js ile oluşturulmuş gerçekçi küp geometrisi.
- **Rastgele Sonuçlar:** Her tıklamada rastgele bir süre ve yönde dönerek rastgele durur.
- **Renk Kodlu Yüzeyler:** Zarın her yüzeyi farklı bir renkle temsil edilmiştir.
- **Tam Ekran:** Responsive tasarım ile tüm ekranı kaplar.

## Kurulum

1. Projeyi bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/aykido/zar-atma-3d.git
   ```
2. Proje dizinine gidin:
   ```bash
   cd zar-atma-3d
   ```

## Çalıştırma

Bu proje statik HTML/JS dosyalarından oluşur. Yerel olarak çalıştırmak için basit bir HTTP sunucusu kullanmanız önerilir (CORS politikaları nedeniyle dosyalar doğrudan açıldığında bazı özellikler çalışmayabilir).

**Python ile:**
```bash
python -m http.server
```
Ardından tarayıcınızda `http://localhost:8000` adresine gidin.

**Node.js (http-server) ile:**
```bash
npx http-server
```

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
