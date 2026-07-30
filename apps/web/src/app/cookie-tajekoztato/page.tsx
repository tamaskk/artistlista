import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Cookie (süti) tájékoztató" };

export default function Page() {
  return (
    <LegalLayout title="Cookie (süti) tájékoztató" updated="2026. július 29.">
      <p>
        A süti (cookie) a böngésződben tárolt kis adatfájl. A jelen tájékoztató a GDPR és az
        elektronikus hírközlésről szóló szabályok (ePrivacy) alapján ismerteti, milyen sütiket és
        böngészőtárolót használ az ArtistList.
      </p>

      <h2>1. Milyen adatokat tárolunk a böngészőben</h2>
      <p>
        A Platform <strong>nem használ reklám- vagy nyomkövető (marketing) sütit</strong>, és nem
        oszt meg adatot hirdetési hálózatokkal. Kizárólag a működéshez szükséges és funkcionális
        tárolást alkalmazunk:
      </p>
      <table>
        <thead>
          <tr>
            <th>Név / típus</th>
            <th>Cél</th>
            <th>Kategória</th>
            <th>Élettartam</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>munkamenet / bejelentkezési süti (Auth.js)</td>
            <td>bejelentkezett állapot fenntartása az admin/beküldő felületen</td>
            <td>feltétlenül szükséges</td>
            <td>munkamenet / max. [30] nap</td>
          </tr>
          <tr>
            <td>
              <code>artistlist:favorites</code> (localStorage)
            </td>
            <td>a kedvencekbe mentett események megjegyzése ezen az eszközön</td>
            <td>funkcionális</td>
            <td>törlésig</td>
          </tr>
          <tr>
            <td>térkép-tile gyorsítótár (OpenFreeMap/böngésző)</td>
            <td>a térkép gyorsabb betöltése</td>
            <td>funkcionális</td>
            <td>böngésző szerint</td>
          </tr>
        </tbody>
      </table>

      <h2>2. Hozzájárulás</h2>
      <p>
        A feltétlenül szükséges és a fenti funkcionális tárolás a szolgáltatás nyújtásához
        elengedhetetlen, ezért ezekhez a jogszabály szerint nem szükséges előzetes hozzájárulás.
        Mivel a Platform <strong>nem használ marketing/analitikai nyomkövetést</strong>, külön
        süti-hozzájáruló sáv (banner) nem szükséges. Amennyiben a jövőben analitikai vagy marketing
        sütiket vezetünk be, azokhoz előzetes, kifejezett hozzájárulást kérünk, és e tájékoztatót
        frissítjük.
      </p>

      <h2>3. A sütik kezelése, letiltása</h2>
      <p>
        A böngésződ beállításaiban bármikor törölheted vagy letilthatod a sütiket és a helyi
        tárolót. A feltétlenül szükséges sütik letiltása esetén a bejelentkezést igénylő funkciók
        (pl. koncert-beküldés, admin) nem működnek megfelelően. A kedvencek törlése esetén a
        mentett események elvesznek az adott eszközön.
      </p>

      <h2>4. Kapcsolódó dokumentumok</h2>
      <p>
        A személyes adatok kezeléséről bővebben az{" "}
        <a href="/adatkezeles">Adatvédelmi tájékoztatóban</a>, a szolgáltatás feltételeiről az{" "}
        <a href="/aszf">ÁSZF-ben</a> olvashatsz.
      </p>
    </LegalLayout>
  );
}
