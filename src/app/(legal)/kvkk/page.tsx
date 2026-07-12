import { LegalLayout } from "@/components/shared/legal-layout"
import { COMPANY_NAME, COMPANY_EMAIL, COMPANY_WEBSITE, KVKK_LAST_UPDATED, DATA_OFFICER_NAME } from "@/lib/kvkk"

export default function KVKKPage() {
  return (
    <LegalLayout title="KVKK Aydınlatma Metni">
      <p className="text-sm text-muted-foreground mb-6">
        Son güncelleme: {KVKK_LAST_UPDATED}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Veri Sorumlusu</h2>
        <p>
          {COMPANY_NAME} ({COMPANY_WEBSITE}) olarak, 6698 sayılı Kişisel Verilerin
          Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz.
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Veri Sorumlusu: {DATA_OFFICER_NAME}</li>
          <li>İletişim: {COMPANY_EMAIL}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. İşlenen Kişisel Veriler</h2>
        <p>Uygulamamız üzerinden aşağıdaki kişisel verileriniz işlenebilir:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Kimlik bilgileri (ad, e-posta adresi)</li>
          <li>İletişim bilgileri</li>
          <li>Yüklenen ders notu, slayt ve fotoğraf gibi çalışma materyalleri</li>
          <li>Uygulama kullanım verileri ve istatistikler</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Verilerin İşlenme Amaçları</h2>
        <p>Kişisel verileriniz;</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Hesap oluşturma ve kimlik doğrulama</li>
          <li>Yapay zekâ ile soru üretme hizmetinin sağlanması</li>
          <li>Materyallerin saklanması ve yönetilmesi</li>
          <li>Teknik destek ve kullanıcı iletişimi</li>
          <li>Hizmet kalitesinin artırılması</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Verilerin Saklanması ve Güvenliği</h2>
        <p>
          Verileriniz Supabase altyapısında güvenli bir şekilde saklanır. Erişim yalnızca
          yetkilendirilmiş kullanıcılarla sınırlıdır ve iletişimde şifreleme kullanılır.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Haklarınız</h2>
        <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenen verilerinize erişim talep etme</li>
          <li>Yanlış veya eksik verilerin düzeltilmesini isteme</li>
          <li>Verilerinizin silinmesini veya yok edilmesini isteme</li>
          <li>İşleme faaliyetlerine itiraz etme</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">6. İletişim</h2>
        <p>
          Haklarınızı kullanmak veya sorularınız için{" "}
          <a href={`mailto:${COMPANY_EMAIL}`} className="text-primary hover:underline">
            {COMPANY_EMAIL}
          </a>{" "}
          adresine yazabilirsiniz.
        </p>
      </section>
    </LegalLayout>
  )
}
