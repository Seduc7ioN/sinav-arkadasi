# Quiz Modu Tasarım Dokümanı

## Amaç
Kullanıcının AI tarafından üretilen sorularla interaktif bir şekilde quiz çözmesini sağlamak. Skor, süre ve her bir cevap veritabanına kaydedilerek ileride istatistik ve ilerleme takibi özelliklerine veri sağlanır.

## Kapsam
- Web (Next.js) ve mobil (Flutter) için ortak quiz deneyimi.
- İlk aşamada web öncelikli implementasyon; mobilde aynı API'leri kullanarak benzer akış.

## Veritabanı Şeması
Mevcut tablolar kullanılır:
- `quiz_sessions`: Her quiz oturumu için bir kayıt.
- `quiz_answers`: Her soruya verilen cevap.

Yeni eklemeler:
- `quiz_sessions.total`: Toplam soru sayısı.
- `quiz_sessions.score`: Doğru cevap sayısı.
- `quiz_sessions.status`: `in_progress` → `completed`.
- `quiz_answers.selected_option`: Kullanıcının seçtiği şık.
- `quiz_answers.is_correct`: Doğru/yanlış.

## API Endpoint'leri

### POST /api/study/quiz/start
Bir materyal için yeni quiz oturumu başlatır.
**Body:** `{ materialId: string }`
**Yanıt:** `{ session: QuizSession, questions: Question[] }`
**İş kuralları:**
- Materyal kullanıcıya ait olmalı.
- `status = completed` olan materyallerde quiz başlatılabilir.
- Aktif `in_progress` oturumu varsa onu devam ettirir.

### POST /api/study/quiz/answer
Bir soruya cevap kaydeder.
**Body:** `{ sessionId: string, questionId: string, selectedOption: number }`
**Yanıt:** `{ answer: QuizAnswer }`
**İş kuralları:**
- Soru, oturumun materyalına ait olmalı.
- Aynı soruya tekrar cevap verilirse üzerine yazılır.
- `is_correct` server tarafında `questions.correct_option` ile karşılaştırılarak hesaplanır.

### POST /api/study/quiz/finish
Oturumu tamamlar.
**Body:** `{ sessionId: string }`
**Yanıt:** `{ session: QuizSession }`
**İş kuralları:**
- Tüm sorulara cevap verilmemişse eksik olanlar `null` olarak kaydedilir ve `is_correct = false` sayılır.
- `score` ve `total` hesaplanıp `status = completed` yapılır.

### GET /api/study/quiz/session/[id]
Bir oturumun tüm detaylarını ve cevapları döner.

## Web Sayfaları

### /dashboard/quiz/[materialId]
Quiz çözme ekranı.
**Bileşenler:**
- `QuizPlayer`: Soruları sırayla gösterir, cevap seçimini yönetir.
- `QuizTimer`: İsteğe bağlı geri sayım (her soru için 60 sn veya toplam süre).
- `QuizProgress`: Kaçıncı soruda olunduğunu gösterir.

**Akış:**
1. Sayfa yüklenince `/api/study/quiz/start` çağrılır.
2. Sorular local state'e alınır.
3. Kullanıcı şık seçince `/api/study/quiz/answer` çağrılır.
4. "Sonraki" ile bir sonraki soruya geçilir.
5. Son soruda "Bitir" ile `/api/study/quiz/finish` çağrılır.

### /dashboard/quiz/session/[sessionId]
Sonuç ekranı.
**Bileşenler:**
- `QuizResult`: Toplam doğru/yanlış, yüzde, süre.
- `QuestionReview`: Her sorunun doğru cevabı, kullanıcı cevabı ve açıklaması.

## Mobil Ekranlar
- `QuizScreen`: Webdeki `QuizPlayer` ile aynı akış.
- `QuizResultScreen`: Sonuç ekranı.

## UI/UX Notları
- Şıklar büyük, dokunmaya uygun butonlar olacak.
- Seçilen şık anında görsel geri bildirim alacak.
- Zamanlayıcı süresi dolarsa otomatik olarak sonraki soruya geçilecek (opsiyonel).
- Sonuç ekranında başarı oranı renkli bir progress ring ile gösterilecek.

## Güvenlik
- Tüm API route'ları `getUserFromRequest` ile auth kontrolü yapacak.
- `is_correct` hesaplaması server tarafında yapılacak.
- Kullanıcı sadece kendi materyalleri ve oturumları üzerinde işlem yapabilecek.

## Hata Yönetimi
- Materyal tamamlanmamışsa: "Önce soruların oluşturulması gerekiyor."
- Aktif oturum varsa: "Devam eden bir quizin var." veya otomatik devam et.
- Network hatası: Tekrar dene butonu.
