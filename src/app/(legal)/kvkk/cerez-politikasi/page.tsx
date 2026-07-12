import { LegalLayout } from "@/components/shared/legal-layout"
import { COMPANY_NAME, KVKK_LAST_UPDATED } from "@/lib/kvkk"

export default function CerezPolitikasiPage() {
  return (
    <LegalLayout title="Çerez Politikası">
      <p className="text-sm text-muted-foreground mb-6">
        Son güncelleme: {KVKK_LAST_UPDATED}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Çerez Nedir?</h2>
        <p>
          Çerezler, cihazınıza yerleştirilen küçük metin dosyalarıdır. {COMPANY_NAME} olarak,
          hizmetlerimizi daha işlevsel ve kullanıcı dostu hale getirmek için çerezleri kullanırız.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Kullandığımız Çerezler</h2>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Zorunlu Çerezler:</strong> Uygulamanın çalışması için gerekli oturum ve
            güvenlik çerezleri.
          </li>
          <li>
            <strong>Analitik Çerezler:</strong> Hizmet kalitemizi ölçmek ve geliştirmek için
            kullanılan, anonim kullanım istatistikleri.
          </li>
          <li>
            <strong>Tercih Çerezleri:</strong> Dil, tema gibi kullanıcı tercihlerini hatırlamak
            için kullanılır.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Çerezleri Nasıl Yönetirsiniz?</h2>
        <p>
          Tarayıcı ayarlarınızdan çerezleri kabul etmemeyi veya silmeyi tercih edebilirsiniz.
          Ancak zorunlu çerezlerin devre dışı bırakılması uygulamanın düzgün çalışmamasına
          neden olabilir.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">4. Değişiklikler</h2>
        <p>
          Çerez politikamızda zaman zaman güncellemeler yapabiliriz. Güncel metne bu sayfadan
          ulaşabilirsiniz.
        </p>
      </section>
    </LegalLayout>
  )
}
