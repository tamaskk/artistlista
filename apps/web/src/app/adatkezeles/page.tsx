import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Adatvédelmi tájékoztató" };

export default function Page() {
  return (
    <LegalLayout title="Adatvédelmi tájékoztató" updated="2026. július 29.">
      <p>
        Jelen tájékoztató az Európai Parlament és a Tanács (EU) 2016/679 rendelete (
        <strong>GDPR</strong>) és az információs önrendelkezési jogról szóló 2011. évi CXII. törvény
        (Infotv.) alapján ismerteti az ArtistList Platformon történő személyes adatok kezelését.
      </p>

      <h2>1. Az adatkezelő</h2>
      <ul>
        <li>Adatkezelő: [Üzemeltető neve]</li>
        <li>Székhely: [székhely]</li>
        <li>E-mail (adatvédelem): [adatvédelmi e-mail]</li>
        <li>Adatvédelmi tisztviselő (ha kötelező): [DPO neve / elérhetősége]</li>
      </ul>

      <h2>2. A kezelt adatok köre</h2>
      <ul>
        <li>
          <strong>Regisztrációs adatok:</strong> név, e-mail cím, jelszó (kizárólag titkosított
          hash formában), szerepkör (fan / előadó / menedzsment).
        </li>
        <li>
          <strong>Profil- és tartalmi adatok:</strong> előadónév, bemutatkozó, műfaj, székhely
          város, feltöltött képek URL-jei, közösségi linkek, beküldött események adatai.
        </li>
        <li>
          <strong>Használati adatok:</strong> kedvencek/mentések (a böngésződben, localStorage), a
          mentések összesített (nem személyhez kötött) száma.
        </li>
        <li>
          <strong>Technikai adatok:</strong> IP-cím, eszköz-/böngészőadatok, naplóadatok a
          biztonságos működéshez.
        </li>
        <li>
          <strong>Hírlevél (opcionális):</strong> e-mail cím feliratkozás esetén.
        </li>
      </ul>

      <h2>3. Az adatkezelés céljai és jogalapjai</h2>
      <table>
        <thead>
          <tr>
            <th>Cél</th>
            <th>Jogalap (GDPR 6. cikk)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fiók létrehozása, belépés, a szolgáltatás nyújtása</td>
            <td>szerződés teljesítése – 6. cikk (1) b)</td>
          </tr>
          <tr>
            <td>Moderálás, jogsértések kezelése, biztonság</td>
            <td>jogos érdek – 6. cikk (1) f)</td>
          </tr>
          <tr>
            <td>Hírlevél küldése</td>
            <td>hozzájárulás – 6. cikk (1) a)</td>
          </tr>
          <tr>
            <td>Számlázás (kiemelés díja), jogi kötelezettségek</td>
            <td>jogi kötelezettség – 6. cikk (1) c)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Megőrzési idő</h2>
      <ul>
        <li>Fiókadatok: a fiók fennállásáig, majd törlésig / max. [pl. 30] napig archiválva.</li>
        <li>Számlázási adatok: a számviteli törvény szerint 8 évig.</li>
        <li>Hírlevél: a leiratkozásig.</li>
        <li>Naplóadatok: [pl. 6–12] hónapig.</li>
      </ul>

      <h2>5. Címzettek és adatfeldolgozók</h2>
      <p>Az adatkezelés során az alábbi közreműködőket vehetjük igénybe:</p>
      <ul>
        <li>Tárhely-/felhőszolgáltató: [szolgáltató neve, ország]</li>
        <li>Adatbázis-szolgáltató (MongoDB/hosting): [szolgáltató neve, ország]</li>
        <li>E-mail küldő szolgáltató (tranzakciós e-mailek): [szolgáltató neve, ország]</li>
        <li>Térkép- és geokódolási szolgáltató: OpenStreetMap / OpenFreeMap / [MapTiler, ha használt]</li>
        <li>Képtárhely (ha használt): [Cloudinary vagy egyéb]</li>
      </ul>
      <p>
        Amennyiben valamely feldolgozó az EGT-n kívül tárol adatot, a továbbítás megfelelő
        garanciák (pl. EU általános szerződési feltételek) mellett történik.
      </p>

      <h2>6. Az érintett jogai</h2>
      <ul>
        <li>hozzáférés a kezelt adataihoz;</li>
        <li>helyesbítés;</li>
        <li>törlés („elfeledtetéshez való jog");</li>
        <li>az adatkezelés korlátozása;</li>
        <li>adathordozhatóság;</li>
        <li>tiltakozás a jogos érdeken alapuló kezelés ellen;</li>
        <li>hozzájárulás bármikori visszavonása (a visszavonás a korábbi kezelést nem érinti).</li>
      </ul>
      <p>
        A jogok gyakorlása a fenti e-mail címen kezdeményezhető; kérelmére indokolatlan késedelem
        nélkül, legfeljebb egy hónapon belül válaszolunk.
      </p>

      <h2>7. Jogorvoslat</h2>
      <p>
        Panasz esetén a <strong>Nemzeti Adatvédelmi és Információszabadság Hatósághoz</strong>{" "}
        (NAIH, 1055 Budapest, Falk Miksa utca 9–11.,{" "}
        <a href="https://naih.hu" target="_blank" rel="noreferrer">
          naih.hu
        </a>
        ) fordulhat, vagy bírósághoz (a lakóhelye szerint illetékes törvényszék).
      </p>

      <h2>8. Adatbiztonság</h2>
      <p>
        Az adatokat megfelelő technikai és szervezési intézkedésekkel védjük (titkosított jelszó,
        hozzáférés-korlátozás, biztonságos kapcsolat). Jelszót olvasható formában nem tárolunk.
      </p>

      <h2>9. Kiskorúak</h2>
      <p>
        A szolgáltatás 16 éven aluli személyek számára önálló regisztrációval nem javasolt; ilyen
        adatkezelés csak a szülői felügyeletet gyakorló hozzájárulásával jogszerű.
      </p>

      <h2>10. Módosítás</h2>
      <p>
        A tájékoztatót az Üzemeltető szükség szerint frissíti; a mindenkori hatályos változat a
        Platformon érhető el. A sütikről külön a{" "}
        <a href="/cookie-tajekoztato">Cookie tájékoztató</a> rendelkezik.
      </p>
    </LegalLayout>
  );
}
