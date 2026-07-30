import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Általános Szerződési Feltételek" };

export default function Page() {
  return (
    <LegalLayout title="Általános Szerződési Feltételek (ÁSZF)" updated="2026. július 29.">
      <h2>1. Az Üzemeltető adatai</h2>
      <p>
        Az ArtistList online platformot (a továbbiakban: <strong>Platform</strong>) üzemelteti:
      </p>
      <ul>
        <li>Cégnév / név: [Üzemeltető neve]</li>
        <li>Székhely: [székhely cím]</li>
        <li>Cégjegyzékszám / nyilvántartási szám: [cégjegyzékszám]</li>
        <li>Adószám: [adószám]</li>
        <li>Képviselő: [képviselő neve]</li>
        <li>E-mail: [kapcsolati e-mail]</li>
        <li>Tárhelyszolgáltató: [tárhelyszolgáltató neve, címe, e-mail]</li>
      </ul>
      <p>
        A jelen ÁSZF a Platform használatának feltételeit szabályozza az elektronikus
        kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény és a Polgári Törvénykönyv
        (2013. évi V. törvény) rendelkezéseivel összhangban.
      </p>

      <h2>2. Fogalmak</h2>
      <ul>
        <li>
          <strong>Platform:</strong> az ArtistList weboldal és admin felület, amely magyar előadók
          és koncertek felfedezését teszi lehetővé térképen és listában.
        </li>
        <li>
          <strong>Felhasználó:</strong> bármely látogató vagy regisztrált fiókkal rendelkező
          személy.
        </li>
        <li>
          <strong>Előadó / Menedzsment:</strong> regisztrált fiók, amely előadói profilt és
          eseményeket kezelhet, jóváhagyást követően.
        </li>
        <li>
          <strong>Esemény:</strong> a Platformon megjelenített koncert vagy fellépés adatlapja.
        </li>
        <li>
          <strong>Tartalom:</strong> a Felhasználók által feltöltött szöveg, kép, link és minden
          egyéb adat.
        </li>
      </ul>

      <h2>3. A szolgáltatás leírása</h2>
      <p>
        A Platform <strong>információs aggregátor</strong>: koncertek, fellépések és előadók
        adatait gyűjti és jeleníti meg. A Platform <strong>nem jegyértékesítő</strong> — a
        jegyvásárlás minden esetben külső szolgáltatónál (pl. jegyértékesítő partner) történik, a
        Platform csak átirányító linket biztosít. A megjelenített adatok (időpont, ár, helyszín)
        tájékoztató jellegűek, azok pontosságáért az adatot feltöltő, illetve az esemény szervezője
        felel.
      </p>

      <h2>4. Regisztráció és fiókok</h2>
      <p>
        A Platform egyes funkciói regisztrációhoz kötöttek. Háromféle fiók létezik: (a) általános
        (fan) fiók koncert-beküldéshez és kedvencekhez; (b) előadói fiók; (c) menedzsment fiók.
      </p>
      <ul>
        <li>
          A regisztráció során valós adatokat kell megadni. A jelszó titokban tartásáért a
          Felhasználó felel.
        </li>
        <li>
          Az előadói és menedzsment regisztráció <strong>az Üzemeltető jóváhagyásához</strong>{" "}
          kötött; a fiók a jóváhagyásig nem használható belépésre.
        </li>
        <li>
          Az Üzemeltető jogosult a valótlan adatokat tartalmazó, vagy visszaélésszerű fiókokat
          előzetes értesítés nélkül felfüggeszteni vagy törölni.
        </li>
      </ul>

      <h2>5. Felhasználó által feltöltött tartalom</h2>
      <ul>
        <li>
          A Felhasználó szavatolja, hogy az általa feltöltött Tartalom (különösen a{" "}
          <strong>képek</strong> és szövegek) <strong>jogtiszta</strong>, azok felhasználására
          jogosult, és nem sért harmadik személy szerzői, védjegy-, személyiségi vagy egyéb jogát.
        </li>
        <li>
          A Felhasználó a feltöltéssel nem kizárólagos, díjmentes, területi korlátozás nélküli
          felhasználási engedélyt ad az Üzemeltetőnek a Tartalom Platformon való megjelenítésére.
        </li>
        <li>
          Az Üzemeltető <strong>moderálhatja</strong> a beküldött eseményeket és előadói
          profilokat; a jogsértő vagy valótlan Tartalmat eltávolíthatja.
        </li>
        <li>
          Jogsértés észlelése esetén az <a href="/kapcsolat">elérhetőségeinken</a> lehet
          bejelentést tenni; az Üzemeltető a bejelentett tartalmat indokolt esetben eltávolítja
          (értesítési-eltávolítási eljárás, Eker. tv. 13. §).
        </li>
      </ul>

      <h2>6. Kiemelés (fizetős hirdetési szolgáltatás)</h2>
      <p>
        Az Előadók/Menedzsmentek díj ellenében kiemelhetik eseményeiket (5 csomag, választható
        időtartammal). A kiemelt esemény a listában előrébb és a térképen kiemelten jelenik meg. A
        díjak és időtartamok a megrendelési felületen megjelennek; a szolgáltatás a kiválasztott
        időtartam lejártáig aktív.
      </p>
      <ul>
        <li>A díj a megrendeléskor esedékes; a számlázás [számlázási mód] szerint történik.</li>
        <li>
          A kiemelés digitális szolgáltatás, amely a megrendelést követően azonnal megkezdődik. A
          fogyasztónak minősülő megrendelő a 45/2014. (II. 26.) Korm. rendelet szerinti elállási
          jogáról a szolgáltatás megkezdése előtt kifejezetten lemond, ennek tudomásulvételével a
          teljesítés megkezdése után elállási jog nem gyakorolható.
        </li>
        <li>
          A kiemelés nem befolyásolja az esemény tartalmi valóságtartalmát; a kiemelt jelleg a
          felületen felismerhető.
        </li>
      </ul>

      <h2>7. Felelősség korlátozása</h2>
      <ul>
        <li>
          Az Üzemeltető nem szavatolja a megjelenített adatok teljességét és pontosságát, mivel
          azok jelentős része nyilvános forrásból vagy Felhasználóktól származik.
        </li>
        <li>
          A jegyvásárlásból, az esemény elmaradásából vagy módosulásából eredő igényekért a
          jegyértékesítő, illetve a szervező felel; a Platform ezekben nem szerződő fél.
        </li>
        <li>
          A külső hivatkozások (jegylinkek, közösségi média) tartalmáért az adott szolgáltató
          felel.
        </li>
      </ul>

      <h2>8. Szellemi tulajdon</h2>
      <p>
        A Platform arculata, forráskódja, adatbázisa és védjegyei az Üzemeltető, illetve
        jogosultjai tulajdonát képezik. Ezek engedély nélküli felhasználása tilos.
      </p>

      <h2>9. Tiltott magatartás</h2>
      <ul>
        <li>valótlan, félrevezető vagy jogsértő adatok feltöltése;</li>
        <li>a Platform működésének zavarása, automatizált lekérdezés (scraping) engedély nélkül;</li>
        <li>mások adataival való visszaélés, jogosulatlan hozzáférés.</li>
      </ul>

      <h2>10. Panaszkezelés és jogorvoslat</h2>
      <p>
        Panasz a fenti e-mail címen tehető. A fogyasztó a lakóhelye szerint illetékes{" "}
        <strong>békéltető testülethez</strong>, illetve a fogyasztóvédelmi hatósághoz fordulhat.
        Online vitarendezés: az Európai Bizottság ODR platformja (
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          ec.europa.eu/consumers/odr
        </a>
        ).
      </p>

      <h2>11. Irányadó jog és záró rendelkezések</h2>
      <p>
        A jelen ÁSZF-re a magyar jog az irányadó. Az Üzemeltető jogosult az ÁSZF-et egyoldalúan
        módosítani; a módosítás a Platformon való közzététellel lép hatályba. A regisztrációval és a
        Platform használatával a Felhasználó az ÁSZF-et elfogadja.
      </p>
    </LegalLayout>
  );
}
