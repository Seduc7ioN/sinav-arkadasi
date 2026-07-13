# Materyal Silme Tasarımı

## Amaç
Kullanıcıların yükledikleri ders notlarını / materyalleri uygulamadan kalıcı olarak silebilmesini sağlamak.

## Kapsam
- API: Mevcut `GET /api/study/[id]` route'una `DELETE` metodu eklenir.
- Liste görünümü: `src/app/dashboard/materials-list.tsx`'te her materyal kartına "Sil" butonu eklenir.
- Detay görünümü: `src/app/dashboard/materials/[id]/page.tsx`'te başlık alanına "Sil" butonu eklenir.
- Her iki buton da onay dialogu açar.
- Silme sonrası kullanıcı dashboard'a yönlendirilir.

## Güvenlik ve Yetkilendirme
- `getUserFromRequest` ile kullanıcı doğrulanır.
- Silinecek materyal `study_materials.user_id = user.id` koşuluyla sorgulanır; kullanıcıya ait olmayan materyal için 404 döner.
- Sadece kendi materyalini silebilir.

## Veri Silme Akışı
1. Materyal kaydını kullanıcıya ait olduğunu doğrula.
2. `storage_path`'ten Supabase Storage'daki dosya yolunu çıkar ve Storage'dan sil.
3. `study_materials` tablosundan kaydı sil.
4. Veritabanında `ON DELETE CASCADE` tanımlı olduğu için `questions`, `quiz_sessions`, `quiz_answers` kayıtları otomatik silinir.

## Hata Yönetimi
- Storage silme hatası loglanır ancak DB kaydının silinmesine engel olmaz (kullanıcı deneyimi önceliklidir; ileride temizlik işlemi yapılabilir).
- DB silme hatası kullanıcıya iletilir.

## UI/UX
- "Sil" butonu yıkıcı işlem olduğu için `variant="destructive"` veya outline red stilinde olur.
- Onay dialogu: "Materyali silmek istediğine emin misin? Bu işlem geri alınamaz."
- Silme işlemi devam ederken buton loading durumuna geçer.
