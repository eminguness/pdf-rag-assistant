# 🤖 MEG Asistan - PDF Özetleyici Chatbot

Modern ve güvenli bir PDF özetleyici chatbot uygulaması. Bu proje, Flask framework'ü kullanarak geliştirilmiş, Azure OpenAI entegrasyonu ile çalışan ve PDF belgelerini akıllıca özetleyen, hassas bilgileri maskeleyen gelişmiş bir RAG (Retrieval-Augmented Generation) sistemidir.

## ✨ Özellikler

- 🔒 **Güvenli Maskeleme**: Kişisel bilgileri otomatik olarak maskeleyen NER (Named Entity Recognition) sistemi
- 🧠 **PDF Özetleme**: PDF belgelerini akıllıca analiz eden ve özetleyen RAG teknolojisi
- 🌐 **Modern Web Arayüzü**: Responsive ve kullanıcı dostu arayüz
- 📚 **PDF İşleme**: PDF dosyalarını yükleyip işleyebilme özelliği
- 💾 **Sohbet Geçmişi**: Kullanıcı sohbetlerini kaydetme ve görüntüleme
- 🔐 **Kullanıcı Yönetimi**: Kayıt ve giriş sistemi
- 🎯 **Türkçe Desteği**: Türkçe NER modeli ile yerel dil desteği
- 📄 **Akıllı Özetleme**: PDF içeriğini anlayarak detaylı özetler çıkarma

## 🏗️ Proje Yapısı

```
flask_rag_app/
├── app/
│   ├── chatbot/
│   │   └── rag_chain.py          # RAG zinciri ve AI entegrasyonu
│   ├── routes/
│   │   └── main_routes.py        # Flask route'ları
│   ├── static/
│   │   ├── css/                  # Stil dosyaları
│   │   ├── js/                   # JavaScript dosyaları
│   │   └── images/               # Görsel dosyalar
│   ├── templates/                # HTML şablonları
│   ├── masking2.py              # Maskeleme sistemi
│   └── __init__.py              # Flask app factory
├── data/                        # Belge verileri
├── history/                     # Sohbet geçmişi
├── maskeleme/                   # Maskeleme dosyaları
├── requirements.txt             # Python bağımlılıkları
└── run.py                      # Uygulama başlatıcı
```

## 🚀 Kurulum

### Gereksinimler

- Python 3.8+
- Azure OpenAI hesabı
- Git

### Adım 1: Projeyi Klonlayın

```bash
git clone <repository-url>
cd flask_rag_app
```

### Adım 2: Sanal Ortam Oluşturun

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Adım 3: Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

### Adım 4: Ortam Değişkenlerini Ayarlayın

Proje kök dizininde `.env` dosyası oluşturun:

```env
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
```

### Adım 5: PDF Dosyalarını Hazırlayın

`maskeleme/` klasöründe:
- PDF dosyalarınızı yükleyin
- `belge.txt`: RAG sistemi için kaynak belge (PDF'den çıkarılmış metin)
- `belge.json`: Maskeleme için metadata dosyası

### Adım 6: Uygulamayı Çalıştırın

```bash
python run.py
```

Uygulama `http://localhost:5000` adresinde çalışmaya başlayacaktır.

## 🔧 Kullanım

### Ana Özellikler

1. **PDF Yükleme**: PDF dosyalarınızı sisteme yükleyin
2. **Soru Sorma**: PDF içeriği hakkında sorularınızı yazın
3. **Otomatik Maskeleme**: Sistem kişisel bilgileri otomatik olarak maskeler
4. **Akıllı Özetleme**: RAG sistemi PDF tabanlı detaylı cevaplar üretir
5. **Geçmiş Görüntüleme**: Önceki sohbetlerinizi görüntüleyebilirsiniz

### Maskeleme Sistemi

Sistem şu tür bilgileri otomatik olarak maskeler:
- 👤 Kişi isimleri
- 🏢 Kurum isimleri  
- 📍 Yer isimleri
- 📧 E-posta adresleri
- 📞 Telefon numaraları
- 🆔 TC Kimlik numaraları

## 🛠️ Teknolojiler

- **Backend**: Flask, Python
- **AI/ML**: LangChain, Azure OpenAI, HuggingFace Transformers
- **Vektör Veritabanı**: ChromaDB
- **NLP**: BERT Türkçe NER modeli
- **Frontend**: HTML5, CSS3, JavaScript
- **Embedding**: Sentence Transformers
- **PDF İşleme**: PDF metin çıkarma ve analiz

## 📁 Önemli Dosyalar

- `app/chatbot/rag_chain.py`: RAG zinciri ve AI entegrasyonu
- `app/masking2.py`: Maskeleme sistemi
- `app/routes/main_routes.py`: API endpoint'leri
- `maskeleme/belge.txt`: PDF'den çıkarılmış kaynak metin
- `maskeleme/belge.json`: Maskeleme metadata'sı
- `maskeleme/muhammed_emin_gunes_cv.pdf`: Örnek PDF dosyası

## 🔒 Güvenlik

- Kişisel bilgiler otomatik olarak maskelenir
- Maskeleme metadata'sı güvenli şekilde saklanır
- Azure OpenAI API anahtarları environment variable olarak yönetilir





## 📞 İletişim

Proje hakkında sorularınız için:
- E-posta: [emingunes723@gmail.com]

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
