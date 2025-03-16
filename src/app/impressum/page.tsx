import React from 'react'

export default function Impressum() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Impressum</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
        <p>EIFELSCHRAUBER GmbH</p>
        <p>
          <a 
            href="https://maps.app.goo.gl/qjGD7G5Udd5nTYf86" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Tuchwiese 7a
            <br />
            54570 Wallenborn
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vertreten durch</h2>
        <p>Max Mustermann</p>
        <p>Geschäftsführer</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
        <p>Telefon: +49 (0) 123 456789</p>
        <p>E-Mail: info@eifelschrauber.de</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Registereintrag</h2>
        <p>Eintragung im Handelsregister</p>
        <p>Registergericht: Amtsgericht Trier</p>
        <p>Registernummer: HRB 12345</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Umsatzsteuer-ID</h2>
        <p>Umsatzsteuer-Identifikationsnummer gemäß §27a Umsatzsteuergesetz:</p>
        <p>DE 123 456 789</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Streitschlichtung</h2>
        <p className="mb-4">
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          <br />
          <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:underline">
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </div>
  )
} 