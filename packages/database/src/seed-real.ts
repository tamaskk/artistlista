/**
 * Additív seed: valós magyar előadók (Bandsintown-listák alapján) + helyszínek + események.
 * Nem törli a meglévő adatokat; a saját előadóit slug alapján upserteli.
 * Futtatás: pnpm --filter @artistlist/database seed:real
 */
import { slugify } from "@artistlist/types";
import { loadRootEnv } from "./load-env";
import { connectDB } from "./connect";

loadRootEnv();
import { Artist } from "./models/artist";
import { Event } from "./models/event";
import { Venue } from "./models/venue";
import { uniqueSlug } from "./helpers";

/** 2026, budapesti nyári idő (UTC+2) szerinti időpont. */
function at(month: number, day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(2026, month - 1, day, hour - 2, minute));
}

// ── előadók (kép: Wikimedia Commons) ────────────────────────────────
const ARTISTS = [
  {
    name: "Azahriah",
    genres: ["pop", "hip-hop"],
    homeCity: "Budapest",
    shortBio: "A hazai popzene megkerülhetetlen alakja — műfajok közt szabadon mozgó dalokkal és rekorddöntő koncertekkel.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Azahriah_Sziget_Fesztiv%C3%A1l_2022.jpg/960px-Azahriah_Sziget_Fesztiv%C3%A1l_2022.jpg",
  },
  {
    name: "Carson Coma",
    genres: ["indie", "rock"],
    homeCity: "Budapest",
    shortBio: "Hatfős indie-rock zenekar Budapestről — retró hangzás, ironikus dalszövegek, energikus élő show.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Carson_Coma.jpg/960px-Carson_Coma.jpg",
  },
  {
    name: "Dzsúdló",
    genres: ["pop", "hip-hop"],
    homeCity: "Budapest",
    shortBio: "Őszinte, alternatív popdalok a fiatal generáció egyik legnépszerűbb hangjától.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Dzsudlo_BudapestPark_2024.jpg/960px-Dzsudlo_BudapestPark_2024.jpg",
  },
  {
    name: "DESH",
    genres: ["hip-hop", "pop"],
    homeCity: "Budapest",
    shortBio: "Dallamos rap és pop határán — slágerek sora és teltházas fesztiválszínpadok.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8e/DESH_at_Sziget_Festival.jpg",
  },
  {
    name: "WellHello",
    genres: ["pop", "hip-hop"],
    homeCity: "Budapest",
    shortBio: "Fluor és Diaz formációja — tíz éve a hazai bulik megkerülhetetlen slágergyárosa.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Flour_Tomi.jpg/960px-Flour_Tomi.jpg",
  },
  // ── Astro Music / PFR Group + további előadók (kép később) ──────────
  { name: "ValMar", genres: ["pop"], homeCity: "Budapest", image: "", shortBio: "Valki László és Marics Peti duója — a hazai tinipop egyik legnagyobb húzóneve." },
  { name: "T. Danny", genres: ["pop", "hip-hop"], homeCity: "Budapest", image: "", shortBio: "Dallamos rap és pop a fiatal generációnak — hosszabb szünet után visszatérve a nagyszínpadokra." },
  { name: "Belano", genres: ["pop"], homeCity: "Budapest", image: "", shortBio: "A 2025-ös X-Faktor győztese — friss hang a hazai popszíntéren." },
  { name: "Manuel", genres: ["pop", "hip-hop"], homeCity: "Budapest", image: "", shortBio: "Slágergyáros poprapper — teltházas fesztiválszínpadok." },
  { name: "KKevin", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Trap és melodikus rap — a hazai utcai hangzás egyik meghatározó alakja." },
  { name: "VZS", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Feltörekvő rapper — nyers szövegek, kemény beatek." },
  { name: "Ekhoe", genres: ["hip-hop", "pop"], homeCity: "Budapest", image: "", shortBio: "Új generációs előadó a hazai rap/pop határról." },
  { name: "Grasa", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Fiatal rapper az Astro Music köréből." },
  { name: "SHYB 5 STAR", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Feltörekvő rap-formáció a hazai színtérről." },
  { name: "Mollywood", genres: ["hip-hop", "pop"], homeCity: "Budapest", image: "", shortBio: "Az Átlag Felett köréhez tartozó előadó." },
  { name: "Hazetomika", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Fiatal rapper — Átlag Felett színpad." },
  { name: "Buda", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Feltörekvő előadó a hazai rapszíntérről." },
  { name: "Bruno x Spacc", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Bruno és Spacc közös projektje — buli-rap a javából." },
  { name: "K-OSZ Disco", genres: ["elektronikus", "pop"], homeCity: "Budapest", image: "", shortBio: "A K-OSZ Diszkó házigazdája — retró disco-hangulat." },
  { name: "Pumped Gabo", genres: ["elektronikus"], homeCity: "Budapest", image: "", shortBio: "DJ és producer — a STRAND CITY polgármestere." },
  { name: "StadiumX", genres: ["techno-house"], homeCity: "Budapest", image: "", shortBio: "Nemzetközi színtéren is aktív magyar DJ/producer projekt." },
  { name: "Beton.Hofi", genres: ["hip-hop", "pop"], homeCity: "Budapest", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Beton.Hofi_%282023%29.png/960px-Beton.Hofi_%282023%29.png", shortBio: "Egyedi hangvételű rapper — a Citromale Gang frontembere." },
  { name: "MEHRINGER", genres: ["indie", "pop"], homeCity: "Budapest", image: "", shortBio: "Alternatív pop/indie előadó — fesztiválok kedvence." },
  { name: "BSW", genres: ["pop", "hip-hop"], homeCity: "Budapest", image: "", shortBio: "Országjáró fesztiválcsapat — nyáron szinte minden hazai színpadon ott van." },
  { name: "Halott Pénz", genres: ["hip-hop", "pop"], homeCity: "Miskolc", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Halott_P%C3%A9nz_%282023%29.png/960px-Halott_P%C3%A9nz_%282023%29.png", shortBio: "Járai Márk és Miklós formációja Miskolcról — a hazai pop-rap egyik legnagyobb neve, nemzetközi turnékkal." },
  { name: "Pogány Induló", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "A hazai underground rap egyik legnagyobbra nőtt neve — teltházas nagykoncertekkel." },
  { name: "Ótvar Pestis", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Underground rapper — nyers hangvétel, kultikus státusz." },
  { name: "ASAN Budapest", genres: ["hip-hop"], homeCity: "Budapest", image: "", shortBio: "Feltörekvő rapper a hazai színtérről." },
  { name: "ByeAlex és a Slepp", genres: ["pop", "indie"], homeCity: "Budapest", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/ByeAlex%2C_ESC2013_press_conference_01.jpg/960px-ByeAlex%2C_ESC2013_press_conference_01.jpg", shortBio: "Márta Alex zenekara — a hazai indie-pop töretlenül népszerű, sláger-gyáros formációja." },
  { name: "Molnár Tamás", genres: ["pop"], homeCity: "Budapest", image: "", shortBio: "Énekes-dalszerző — ByeAlex és a Slepp koncertvendége." },
];

// ── helyszínek ──────────────────────────────────────────────────────
const VENUES = [
  { name: "STRAND Fesztivál", city: "Zamárdi", street: "Zamárdi szabadstrand", lng: 17.953, lat: 46.883, type: "festival", country: "HU", capacity: 30000 },
  { name: "Plázs Siófok", city: "Siófok", street: "Petőfi sétány 3.", lng: 18.058, lat: 46.904, type: "outdoor", country: "HU", capacity: 5000 },
  { name: "Bolyki-völgy", city: "Eger", street: "Bolyki völgy", lng: 20.386, lat: 47.898, type: "outdoor", country: "HU", capacity: 3000 },
  { name: "Gyárkert", city: "Veszprém", street: "Házgyári út 1.", lng: 17.9109, lat: 47.0876, type: "outdoor", country: "HU", capacity: 4000 },
  { name: "Művészetek Völgye – Panoráma Színpad", city: "Kapolcs", street: "Kossuth utca", lng: 17.611, lat: 46.958, type: "festival", country: "HU", capacity: 5000 },
  { name: "Káptalan Kert", city: "Pécs", street: "Káptalan utca 2.", lng: 18.228, lat: 46.077, type: "outdoor", country: "HU", capacity: 1500 },
  { name: "AVA Park", city: "Diakovce", street: "Diakovce (Deáki)", lng: 17.842, lat: 48.14, type: "festival", country: "SK", capacity: 8000 },
  { name: "Telekomosok Fesztiválja", city: "Pilisvörösvár", street: "Fő út", lng: 18.909, lat: 47.618, type: "festival", country: "HU" },
  { name: "Bükfürdő Live", city: "Bükfürdő", street: "Termál körút 2.", lng: 16.765, lat: 47.383, type: "outdoor", country: "HU" },
  { name: "Galántai Amfiteátrum", city: "Galánta", street: "Parková 1.", lng: 17.727, lat: 48.19, type: "outdoor", country: "SK" },
  { name: "Félegyházi Napok", city: "Kiskunfélegyháza", street: "Béke tér", lng: 19.85, lat: 46.712, type: "festival", country: "HU" },
  { name: "Mosonmagyaróvár Szabadtér", city: "Mosonmagyaróvár", street: "Fő út", lng: 17.27, lat: 47.868, type: "outdoor", country: "HU" },
  { name: "Kossuth-kert", city: "Szatmárnémeti", street: "Kossuth-kert", lng: 22.885, lat: 47.792, type: "outdoor", country: "RO" },
  { name: "SZIN – Partfürdő", city: "Szeged", street: "Középkikötő sor 1-3.", lng: 20.157, lat: 46.245, type: "festival", country: "HU", capacity: 20000 },
  { name: "Esztergom Szabadtér", city: "Esztergom", street: "Széchenyi tér", lng: 18.74, lat: 47.785, type: "outdoor", country: "HU" },
  { name: "Campus Fesztivál – Nagyerdő", city: "Debrecen", street: "Nagyerdei park", lng: 21.618, lat: 47.548, type: "festival", country: "HU", capacity: 25000 },
  { name: "Sziget Fesztivál", city: "Budapest", street: "Óbudai-sziget", lng: 19.0553, lat: 47.5497, type: "festival", country: "HU", capacity: 95000 },
  { name: "Ápoló Klub", city: "Kecskemét", street: "Csányi János krt.", lng: 19.6897, lat: 46.9074, type: "club", country: "HU", capacity: 800 },
  { name: "Keszthelyi Szabadtér", city: "Keszthely", street: "Balaton-part", lng: 17.2431, lat: 46.7686, type: "outdoor", country: "HU", capacity: 3000 },
  { name: "Balatonakarattyai Szabadstrand", city: "Balatonakarattya", street: "Aligai út", lng: 18.1806, lat: 46.9975, type: "outdoor", country: "HU", capacity: 2000 },
  { name: "Altér Feszt", city: "Gyenesdiás", street: "Nagymező", lng: 17.2853, lat: 46.7739, type: "festival", country: "HU", capacity: 2500 },
  { name: "PLACC", city: "Szigethalom", street: "Mátyás király u.", lng: 19.0011, lat: 47.3186, type: "outdoor", country: "HU", capacity: 2000 },
  { name: "Várlak Fesztivál", city: "Fülek", street: "Füleki vár (Fiľakovo)", lng: 19.8267, lat: 48.2683, type: "festival", country: "SK", capacity: 8000 },
  { name: "Barba Negra", city: "Budapest", street: "Prielle Kornélia u. 4.", lng: 19.0776, lat: 47.4283, type: "outdoor", country: "HU", capacity: 6000 },
  // ── BSW turné helyszínei ──
  { name: "Vibe Fest", city: "Marosvásárhely", street: "Marosvásárhely (Târgu Mureș)", lng: 24.5514, lat: 46.5386, type: "festival", country: "RO", capacity: 8000 },
  { name: "EFOTT – Velencei-tó", city: "Sukoró", street: "Velencei-tó, Sukoró", lng: 18.6153, lat: 47.2381, type: "festival", country: "HU", capacity: 40000 },
  { name: "Hajómalom Feszt", city: "Gúta", street: "Gúta (Kolárovo)", lng: 17.9833, lat: 47.9167, type: "festival", country: "SK", capacity: 5000 },
  { name: "Rose Fest", city: "Villány", street: "Villány", lng: 18.4553, lat: 45.8697, type: "festival", country: "HU", capacity: 3000 },
  { name: "Hello Völgy", city: "Bánk", street: "Bánki-tó", lng: 19.1167, lat: 47.9333, type: "festival", country: "HU", capacity: 4000 },
  { name: "Fehértone Feszt", city: "Kunfehértó", street: "Kunfehértó, tópart", lng: 19.4103, lat: 46.3767, type: "festival", country: "HU", capacity: 3000 },
  { name: "Gyarmati Vigasságok", city: "Fehérgyarmat", street: "Fehérgyarmat", lng: 22.5119, lat: 47.9858, type: "outdoor", country: "HU", capacity: 5000 },
  { name: "Sic Fest", city: "Sepsiszentgyörgy", street: "Sepsiszentgyörgy (Sf. Gheorghe)", lng: 25.7875, lat: 45.8639, type: "festival", country: "RO", capacity: 6000 },
  { name: "Fürdő Napok", city: "Zalakaros", street: "Gyógyfürdő tér", lng: 17.1275, lat: 46.5556, type: "outdoor", country: "HU", capacity: 3000 },
  { name: "DJ Tour Fest", city: "Tiszafüred", street: "Tiszafüred", lng: 20.7639, lat: 47.6167, type: "festival", country: "HU", capacity: 4000 },
  { name: "Szentkirályi Ifjúsági Gasztrofesztivál", city: "Sajószentkirály", street: "Sajószentkirály", lng: 20.7089, lat: 48.2186, type: "outdoor", country: "HU", capacity: 2500 },
  { name: "Madzagfalvi Napok", city: "Békés", street: "Békés, városközpont", lng: 21.1333, lat: 46.7667, type: "outdoor", country: "HU", capacity: 5000 },
  { name: "Bridge Garden", city: "Győr", street: "Bercsényi liget", lng: 17.6504, lat: 47.6875, type: "outdoor", country: "HU", capacity: 4000 },
  { name: "Tokaj Fesztiválkatlan", city: "Tokaj", street: "Fesztiválkatlan", lng: 21.4097, lat: 48.1167, type: "festival", country: "HU", capacity: 8000 },
  // ── Halott Pénz turné helyszínei ──
  { name: "Amszterdam", city: "Amszterdam", street: "Amsterdam", lng: 4.9041, lat: 52.3676, type: "club", country: "NL", capacity: 1500 },
  { name: "Antwerpen", city: "Antwerpen", street: "Antwerpen", lng: 4.4025, lat: 51.2194, type: "club", country: "BE", capacity: 1200 },
  { name: "Luxemburg", city: "Luxemburg", street: "Luxembourg", lng: 6.1296, lat: 49.6116, type: "club", country: "LU", capacity: 1000 },
  { name: "Nürnberg", city: "Nürnberg", street: "Nürnberg", lng: 11.0767, lat: 49.4521, type: "club", country: "DE", capacity: 1500 },
  { name: "Bécs", city: "Bécs", street: "Wien", lng: 16.3738, lat: 48.2082, type: "club", country: "AT", capacity: 2000 },
  { name: "Komárom", city: "Komárom", street: "Komárom", lng: 18.1236, lat: 47.7433, type: "outdoor", country: "HU", capacity: 2000 },
  { name: "PEN – Pécsi Egyetemi Napok", city: "Pécs", street: "Pécs, Egyetem", lng: 18.22, lat: 46.079, type: "festival", country: "HU", capacity: 5000 },
  { name: "Szegedi Egyetemi Napok", city: "Szeged", street: "Szeged, TIK", lng: 20.1484, lat: 46.253, type: "festival", country: "HU", capacity: 6000 },
  { name: "Paks", city: "Paks", street: "Paks", lng: 18.8564, lat: 46.6217, type: "outdoor", country: "HU", capacity: 2500 },
  { name: "Gyula", city: "Gyula", street: "Gyula, Várfürdő", lng: 21.2769, lat: 46.6453, type: "outdoor", country: "HU", capacity: 3000 },
  { name: "Toronto", city: "Toronto", street: "Toronto (CAN)", lng: -79.3832, lat: 43.6532, type: "club", country: "CA", capacity: 1500 },
  { name: "Júniusfeszt – Rimaszombat", city: "Rimaszombat", street: "Rimavská Sobota", lng: 20.0222, lat: 48.3844, type: "festival", country: "SK", capacity: 5000 },
  { name: "Fezen – Székesfehérvár", city: "Székesfehérvár", street: "Palotai út", lng: 18.4221, lat: 47.1956, type: "festival", country: "HU", capacity: 12000 },
  { name: "Víz Zene Virág Fesztivál – Tata", city: "Tata", street: "Öreg-tó", lng: 18.3208, lat: 47.6486, type: "festival", country: "HU", capacity: 6000 },
  { name: "Sopronfest", city: "Sopron", street: "Sopron", lng: 16.5845, lat: 47.6817, type: "festival", country: "HU", capacity: 8000 },
  // ── Pogány Induló ──
  { name: "Püspökerdő", city: "Győr", street: "Győr, Püspökerdő", lng: 17.6339, lat: 47.6994, type: "outdoor", country: "HU", capacity: 5000 },
  // ── ByeAlex és a Slepp ──
  { name: "Bátori Nyár", city: "Nyírbátor", street: "Nyírbátor", lng: 22.1281, lat: 47.8394, type: "outdoor", country: "HU", capacity: 3000 },
];

// ── események (Bandsintown-listák, 2026) ────────────────────────────
type Ev = {
  artist: string;
  with?: string[]; // további fellépők (artistNames-be és artistIds-be is bekerül)
  title: string;
  venue: string;
  m: number;
  d: number;
  h: number;
  min?: number;
  free?: boolean;
  soldout?: boolean;
};
const EVENTS: Ev[] = [
  // WellHello
  { artist: "WellHello", title: "WELLHELLO / STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 21, h: 18, min: 30 },
  { artist: "WellHello", title: "WELLHELLO – #SOHAVÉGETNEMÉRŐS10 // Budapest Park", venue: "Budapest Park", m: 8, d: 28, h: 18 },
  // Dzsúdló
  { artist: "Dzsúdló", title: "DZSÚDLÓ // Művészetek Völgye 2026 // Panoráma Színpad", venue: "Művészetek Völgye – Panoráma Színpad", m: 8, d: 2, h: 21 },
  { artist: "Dzsúdló", title: "Dzsúdló // Eger, Bolyki-völgy", venue: "Bolyki-völgy", m: 8, d: 8, h: 20, min: 30 },
  { artist: "Dzsúdló", title: "DZSÚDLÓ / STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 21, h: 23, min: 50 },
  { artist: "Dzsúdló", title: "DZSÚDLÓ / Gyárkert, Veszprém", venue: "Gyárkert", m: 8, d: 28, h: 19 },
  { artist: "Dzsúdló", title: "Dzsúdló Dupla – Budapest Park (1. nap)", venue: "Budapest Park", m: 10, d: 2, h: 19 },
  { artist: "Dzsúdló", title: "Dzsúdló Dupla – Budapest Park (2. nap)", venue: "Budapest Park", m: 10, d: 3, h: 19 },
  // Azahriah
  { artist: "Azahriah", title: "Azahriah / AVA NIGHT", venue: "AVA Park", m: 7, d: 25, h: 18, min: 30 },
  { artist: "Azahriah", title: "Azahriah / Plázs Siófok", venue: "Plázs Siófok", m: 7, d: 31, h: 19 },
  { artist: "Azahriah", title: "AZAHRIAH / STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 20, h: 23 },
  { artist: "Azahriah", title: "Azahriah / Pécs, Káptalan Kert", venue: "Káptalan Kert", m: 8, d: 21, h: 20 },
  { artist: "Azahriah", title: "AZAHRIAH // Eger, Bolyki-völgy", venue: "Bolyki-völgy", m: 9, d: 4, h: 20, min: 30 },
  { artist: "Azahriah", title: "Azahriah / Gyárkert, Veszprém", venue: "Gyárkert", m: 9, d: 12, h: 18, min: 30 },
  { artist: "Azahriah", title: "AZAHRIAH // BUDAPEST PARK", venue: "Budapest Park", m: 9, d: 18, h: 19 },
  // DESH
  { artist: "DESH", title: "DESH / Gyárkert, Veszprém", venue: "Gyárkert", m: 7, d: 25, h: 19 },
  { artist: "DESH", title: "DESH // Eger, Bolyki-völgy", venue: "Bolyki-völgy", m: 8, d: 7, h: 20, min: 30 },
  { artist: "DESH", title: "DESH / STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 22, h: 22 },
  // Carson Coma
  { artist: "Carson Coma", title: "Campus Fesztivál 2026", venue: "Campus Fesztivál – Nagyerdő", m: 7, d: 23, h: 21 },
  { artist: "Carson Coma", title: "Telekomosok Fesztiválja (akusztik trió)", venue: "Telekomosok Fesztiválja", m: 7, d: 25, h: 14, min: 30 },
  { artist: "Carson Coma", title: "Művészetek Völgye", venue: "Művészetek Völgye – Panoráma Színpad", m: 7, d: 26, h: 20, min: 30 },
  { artist: "Carson Coma", title: "Bükfürdő Live", venue: "Bükfürdő Live", m: 7, d: 30, h: 20, min: 30 },
  { artist: "Carson Coma", title: "Galánta, Amfiteátrum", venue: "Galántai Amfiteátrum", m: 8, d: 14, h: 20 },
  { artist: "Carson Coma", title: "Félegyházi Napok", venue: "Félegyházi Napok", m: 8, d: 20, h: 19 },
  { artist: "Carson Coma", title: "STRAND Fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 21, h: 21 },
  { artist: "Carson Coma", title: "Mosonmagyaróvár", venue: "Mosonmagyaróvár Szabadtér", m: 8, d: 22, h: 19 },
  { artist: "Carson Coma", title: "Szatmárnémeti", venue: "Kossuth-kert", m: 8, d: 23, h: 19 },
  { artist: "Carson Coma", title: "SZIN: Szegedi Ifjúsági Napok 2026", venue: "SZIN – Partfürdő", m: 8, d: 27, h: 19 },
  { artist: "Carson Coma", title: "BUDAPEST PARK – Az első felszabadult Carson Coma koncert", venue: "Budapest Park", m: 9, d: 4, h: 18 },
  { artist: "Carson Coma", title: "CARSON COMA / Gyárkert, Veszprém", venue: "Gyárkert", m: 9, d: 5, h: 18, min: 30 },
  { artist: "Carson Coma", title: "PTE WELCOME FEST", venue: "Káptalan Kert", m: 9, d: 12, h: 19, min: 30 },
  { artist: "Carson Coma", title: "Esztergom", venue: "Esztergom Szabadtér", m: 9, d: 25, h: 19 },
  // ── ValMar ──
  { artist: "ValMar", title: "ValMar // Campus Fesztivál 2026", venue: "Campus Fesztivál – Nagyerdő", m: 7, d: 25, h: 22 },
  { artist: "ValMar", title: "ValMar // Gyárkert, Veszprém", venue: "Gyárkert", m: 8, d: 14, h: 20 },
  { artist: "ValMar", title: "ValMar / STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 21, h: 21 },
  { artist: "ValMar", title: "ValMar // Várlak Fesztivál", venue: "Várlak Fesztivál", m: 8, d: 28, h: 21 },
  // ── T. Danny (+ Belano vendég) ──
  { artist: "T. Danny", with: ["Belano"], title: "T. Danny // Budapest Park (vendég: Belano)", venue: "Budapest Park", m: 7, d: 31, h: 20, min: 15 },
  { artist: "T. Danny", title: "T. Danny / STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 20, h: 23, min: 30 },
  // ── Manuel ──
  { artist: "Manuel", title: "Manuel / STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 22, h: 22 },
  // ── KKevin / VZS ──
  { artist: "KKevin", title: "KKevin / STRAND – K-OSZ Diszkó", venue: "STRAND Fesztivál", m: 8, d: 20, h: 22, min: 45 },
  { artist: "VZS", with: ["KKevin"], title: "VZS × KKevin // PLACC, Szigethalom", venue: "PLACC", m: 9, d: 4, h: 20 },
  { artist: "VZS", title: "VZS / STRAND – K-OSZ Diszkó", venue: "STRAND Fesztivál", m: 8, d: 20, h: 18, min: 30 },
  // ── STRAND – NGZ / Átlag Felett színpadok ──
  { artist: "Ekhoe", title: "Ekhoe / STRAND – NGZ színpad", venue: "STRAND Fesztivál", m: 8, d: 20, h: 19 },
  { artist: "Grasa", title: "Grasa / STRAND – NGZ színpad", venue: "STRAND Fesztivál", m: 8, d: 20, h: 19, min: 45 },
  { artist: "SHYB 5 STAR", title: "SHYB 5 STAR / STRAND – NGZ színpad", venue: "STRAND Fesztivál", m: 8, d: 20, h: 20, min: 15 },
  { artist: "K-OSZ Disco", title: "K-OSZ DISCO / STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 20, h: 21 },
  { artist: "Pumped Gabo", title: "Pumped Gabo / STRAND – STRAND CITY", venue: "STRAND Fesztivál", m: 8, d: 20, h: 21, min: 45 },
  { artist: "Bruno x Spacc", title: "Bruno x Spacc / STRAND – K-OSZ Diszkó", venue: "STRAND Fesztivál", m: 8, d: 20, h: 22, min: 15 },
  { artist: "Mollywood", title: "Mollywood / STRAND – Átlag Felett", venue: "STRAND Fesztivál", m: 8, d: 22, h: 19 },
  { artist: "Hazetomika", title: "Hazetomika / STRAND – Átlag Felett", venue: "STRAND Fesztivál", m: 8, d: 22, h: 19, min: 45 },
  { artist: "Buda", title: "Buda / STRAND – Átlag Felett", venue: "STRAND Fesztivál", m: 8, d: 22, h: 20, min: 30 },
  // ── StadiumX ──
  { artist: "StadiumX", title: "StadiumX // SZIN 2026", venue: "SZIN – Partfürdő", m: 8, d: 28, h: 22 },
  // ── Beton.Hofi (Bandsintown) ──
  { artist: "Beton.Hofi", title: "Beton.Hofi // Sziget Festival 2026", venue: "Sziget Fesztivál", m: 8, d: 14, h: 20 },
  { artist: "Beton.Hofi", title: "Beton.Hofi // Ápoló Klub, Kecskemét", venue: "Ápoló Klub", m: 8, d: 15, h: 21 },
  { artist: "Beton.Hofi", title: "Beton.Hofi // Keszthely", venue: "Keszthelyi Szabadtér", m: 8, d: 19, h: 20 },
  { artist: "Beton.Hofi", title: "Beton.Hofi // Káptalan Kert, Pécs", venue: "Káptalan Kert", m: 9, d: 4, h: 20 },
  { artist: "Beton.Hofi", title: "Beton.Hofi – III. Országos Citromale Gang Találkozó", venue: "Barba Negra", m: 9, d: 24, h: 20 },
  { artist: "Beton.Hofi", title: "Beton.Hofi – IV. Országos Citromale Gang Találkozó", venue: "Barba Negra", m: 9, d: 25, h: 20 },
  // ── MEHRINGER (Bandsintown) ──
  { artist: "MEHRINGER", title: "MEHRINGER – Balatonakarattya", venue: "Balatonakarattyai Szabadstrand", m: 7, d: 31, h: 20 },
  { artist: "MEHRINGER", title: "MEHRINGER – Művészetek Völgye, Lőtér", venue: "Művészetek Völgye – Panoráma Színpad", m: 8, d: 1, h: 21 },
  { artist: "MEHRINGER", title: "MEHRINGER – Altér Feszt", venue: "Altér Feszt", m: 8, d: 9, h: 20, free: true },
  { artist: "MEHRINGER", title: "MEHRINGER – Sziget Fesztivál", venue: "Sziget Fesztivál", m: 8, d: 11, h: 19 },
  { artist: "MEHRINGER", title: "MEHRINGER – Strand Fesztivál", venue: "STRAND Fesztivál", m: 8, d: 22, h: 18 },
  { artist: "MEHRINGER", title: "MEHRINGER – Várlak Fesztivál", venue: "Várlak Fesztivál", m: 8, d: 29, h: 20 },
  // ── BSW turné 2026 (screenshotok) ──
  { artist: "BSW", title: "BSW // Plázs, Siófok", venue: "Plázs Siófok", m: 7, d: 3, h: 21 },
  { artist: "BSW", title: "BSW // Vibe Fest, Marosvásárhely", venue: "Vibe Fest", m: 7, d: 4, h: 21 },
  { artist: "BSW", title: "BSW // EFOTT 2026", venue: "EFOTT – Velencei-tó", m: 7, d: 9, h: 22 },
  { artist: "BSW", title: "BSW // Hajómalom Feszt, Gúta", venue: "Hajómalom Feszt", m: 7, d: 10, h: 21 },
  { artist: "BSW", title: "BSW // Rose Fest, Villány", venue: "Rose Fest", m: 7, d: 11, h: 21 },
  { artist: "BSW", title: "BSW // Hello Völgy, Bánk", venue: "Hello Völgy", m: 7, d: 12, h: 20 },
  { artist: "BSW", title: "BSW // Fehértone Feszt, Kunfehértó", venue: "Fehértone Feszt", m: 7, d: 18, h: 21 },
  { artist: "BSW", title: "BSW // Campus Fesztivál 2026", venue: "Campus Fesztivál – Nagyerdő", m: 7, d: 22, h: 22 },
  { artist: "BSW", title: "BSW – Budapest Park Dupla (1. nap)", venue: "Budapest Park", m: 8, d: 6, h: 19 },
  { artist: "BSW", title: "BSW – Budapest Park (2. nap)", venue: "Budapest Park", m: 8, d: 7, h: 19, soldout: true },
  { artist: "BSW", title: "BSW // Gyarmati Vigasságok, Fehérgyarmat", venue: "Gyarmati Vigasságok", m: 8, d: 8, h: 20 },
  { artist: "BSW", title: "BSW // Sic Fest, Sepsiszentgyörgy", venue: "Sic Fest", m: 8, d: 9, h: 21 },
  { artist: "BSW", title: "BSW // Fürdő Napok, Zalakaros", venue: "Fürdő Napok", m: 8, d: 13, h: 20 },
  { artist: "BSW", title: "BSW // DJ Tour Fest, Tiszafüred", venue: "DJ Tour Fest", m: 8, d: 14, h: 21 },
  { artist: "BSW", title: "BSW // Szentkirályi Gasztrofesztivál", venue: "Szentkirályi Ifjúsági Gasztrofesztivál", m: 8, d: 15, h: 20 },
  { artist: "BSW", title: "BSW // STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 20, h: 22 },
  { artist: "BSW", title: "BSW // Madzagfalvi Napok, Békés", venue: "Madzagfalvi Napok", m: 8, d: 21, h: 20 },
  { artist: "BSW", title: "BSW // SZIN 2026", venue: "SZIN – Partfürdő", m: 8, d: 29, h: 22 },
  { artist: "BSW", title: "BSW // Bridge Garden, Győr", venue: "Bridge Garden", m: 9, d: 11, h: 20 },
  { artist: "BSW", title: "BSW // Tokaj Fesztiválkatlan", venue: "Tokaj Fesztiválkatlan", m: 10, d: 3, h: 20 },
  // ── Halott Pénz 2026 turné (poszter) ──
  { artist: "Halott Pénz", title: "Halott Pénz // Amszterdam", venue: "Amszterdam", m: 4, d: 18, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Antwerpen", venue: "Antwerpen", m: 4, d: 19, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Luxemburg", venue: "Luxemburg", m: 4, d: 23, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Nürnberg", venue: "Nürnberg", m: 4, d: 24, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Bécs", venue: "Bécs", m: 4, d: 25, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Komárom", venue: "Komárom", m: 4, d: 30, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Bükfürdő", venue: "Bükfürdő Live", m: 5, d: 1, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // PEN, Pécs", venue: "PEN – Pécsi Egyetemi Napok", m: 5, d: 2, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // Szegedi Egyetemi Napok", venue: "Szegedi Egyetemi Napok", m: 5, d: 9, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // Paks", venue: "Paks", m: 5, d: 15, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Budapest Park", venue: "Budapest Park", m: 5, d: 16, h: 19, soldout: true },
  { artist: "Halott Pénz", title: "Halott Pénz // Gyula", venue: "Gyula", m: 5, d: 22, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Toronto", venue: "Toronto", m: 6, d: 6, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // Júniusfeszt, Rimaszombat", venue: "Júniusfeszt – Rimaszombat", m: 6, d: 12, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // FEZEN", venue: "Fezen – Székesfehérvár", m: 6, d: 20, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // Víz Zene Virág Fesztivál, Tata", venue: "Víz Zene Virág Fesztivál – Tata", m: 6, d: 26, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // Sopronfest", venue: "Sopronfest", m: 7, d: 4, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // Hajómalom Fesztivál, Gúta", venue: "Hajómalom Feszt", m: 7, d: 10, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // EFOTT 2026", venue: "EFOTT – Velencei-tó", m: 7, d: 11, h: 22 },
  { artist: "Halott Pénz", title: "Halott Pénz // Fehértone", venue: "Fehértone Feszt", m: 7, d: 17, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // Plázs, Siófok", venue: "Plázs Siófok", m: 7, d: 18, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // Campus Fesztivál 2026", venue: "Campus Fesztivál – Nagyerdő", m: 7, d: 25, h: 22 },
  { artist: "Halott Pénz", title: "Halott Pénz // Dunafeszt, Esztergom", venue: "Esztergom Szabadtér", m: 8, d: 7, h: 21 },
  { artist: "Halott Pénz", title: "Halott Pénz // Gyárkert, Veszprém", venue: "Gyárkert", m: 8, d: 8, h: 20 },
  { artist: "Halott Pénz", title: "Halott Pénz // STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 21, h: 22 },
  { artist: "Halott Pénz", title: "Halott Pénz // SZIN 2026", venue: "SZIN – Partfürdő", m: 8, d: 26, h: 22 },
  // ── Pogány Induló ──
  { artist: "Pogány Induló", title: "Pogány Induló // Győr, Püspökerdő", venue: "Püspökerdő", m: 8, d: 7, h: 20 },
  { artist: "Pogány Induló", title: "Pogány Induló // STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 22, h: 21 },
  { artist: "Pogány Induló", with: ["Ótvar Pestis", "ASAN Budapest"], title: "Pogány Induló // Budapest Park (vendégek: Ótvar Pestis, ASAN Budapest)", venue: "Budapest Park", m: 9, d: 3, h: 19 },
  // ── ByeAlex és a Slepp ──
  { artist: "ByeAlex és a Slepp", with: ["Molnár Tamás"], title: "ByeAlex és a Slepp (vendég: Molnár Tamás) // Plázs, Siófok", venue: "Plázs Siófok", m: 7, d: 24, h: 21 },
  { artist: "ByeAlex és a Slepp", title: "ByeAlex és a Slepp // SIC Feszt 2026", venue: "Sic Fest", m: 8, d: 8, h: 22 },
  { artist: "ByeAlex és a Slepp", title: "ByeAlex és a Slepp // Sziget Fesztivál 2026", venue: "Sziget Fesztivál", m: 8, d: 13, h: 20 },
  { artist: "ByeAlex és a Slepp", title: "ByeAlex és a Slepp // STRAND fesztivál 2026", venue: "STRAND Fesztivál", m: 8, d: 20, h: 21 },
  { artist: "ByeAlex és a Slepp", title: "ByeAlex és a Slepp // Bátori Nyár, Nyírbátor", venue: "Bátori Nyár", m: 8, d: 21, h: 20 },
  { artist: "ByeAlex és a Slepp", title: "ByeAlex és a Slepp // SZIN 2026", venue: "SZIN – Partfürdő", m: 8, d: 28, h: 22 },
  { artist: "ByeAlex és a Slepp", title: "ByeAlex és a Slepp // Budapest Park", venue: "Budapest Park", m: 9, d: 5, h: 20 },
  { artist: "ByeAlex és a Slepp", title: "ByeAlex és a Slepp // Ápoló Garden, Kecskemét", venue: "Ápoló Klub", m: 9, d: 18, h: 20 },
  { artist: "ByeAlex és a Slepp", title: "ByeAlex és a Slepp // Bridge Garden, Győr", venue: "Bridge Garden", m: 9, d: 26, h: 20 },
];

async function main() {
  await connectDB();

  // előadók upsert
  const artistBySlug = new Map<string, any>();
  for (const a of ARTISTS) {
    const slug = slugify(a.name);
    const doc = await Artist.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: a.name,
          shortBio: a.shortBio,
          bio: `${a.shortBio}\n\nA fellépéslista nyilvános forrásból (Bandsintown) származik — az előadó bármikor claimelheti a profilt.${a.image ? " Fotó: Wikimedia Commons." : ""}`,
          genres: a.genres,
          homeCity: a.homeCity,
          "images.avatar": a.image,
          "images.cover": a.image,
          status: "published",
          featured: true,
          ownerType: "user",
        },
        $setOnInsert: { slug, stats: { followers: 0, views30d: 0 } },
      },
      { upsert: true, new: true },
    );
    artistBySlug.set(a.name, doc);
    console.log("Előadó:", a.name, "→", doc.slug);
  }

  // helyszínek upsert
  const venueByName = new Map<string, any>();
  for (const v of VENUES) {
    const slug = slugify(v.name);
    const doc = await Venue.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: v.name,
          address: { street: v.street, city: v.city, zip: "", country: v.country },
          location: { type: "Point", coordinates: [v.lng, v.lat] },
          type: v.type,
          capacity: v.capacity,
          status: "active",
        },
        $setOnInsert: { slug },
      },
      { upsert: true, new: true },
    );
    venueByName.set(v.name, doc);
  }
  // meglévő Budapest Park
  const bp = await Venue.findOne({ slug: "budapest-park" });
  if (!bp) throw new Error("Budapest Park hiányzik — futtasd előbb az alap seedet");
  venueByName.set("Budapest Park", bp);
  console.log("Helyszínek kész:", venueByName.size);

  // korábbi (általunk generált) események törlése ezekhez az előadókhoz, duplikáció ellen
  const artistIds = [...artistBySlug.values()].map((a) => a._id);
  const del = await Event.deleteMany({ artistIds: { $in: artistIds } });
  console.log("Régi események törölve:", del.deletedCount);

  for (const e of EVENTS) {
    const artist = artistBySlug.get(e.artist);
    const venue = venueByName.get(e.venue);
    if (!artist || !venue) throw new Error(`Hiányzó hivatkozás: ${e.artist} / ${e.venue}`);
    const guests = (e.with ?? []).map((n) => {
      const g = artistBySlug.get(n);
      if (!g) throw new Error(`Hiányzó vendég előadó: ${n}`);
      return g;
    });
    const lineup = [artist, ...guests];
    const startsAt = at(e.m, e.d, e.h, e.min ?? 0);
    await Event.create({
      title: e.title,
      slug: await uniqueSlug(Event, `${e.title}-${startsAt.toISOString().slice(0, 10)}`),
      artistIds: lineup.map((a) => a._id),
      venueId: venue._id,
      location: venue.location,
      city: venue.address.city,
      venueName: venue.name,
      genres: [...new Set(lineup.flatMap((a) => a.genres as string[]))],
      artistNames: lineup.map((a) => a.name),
      startsAt,
      price: e.free ? { kind: "free", currency: "HUF" } : { kind: "unknown", currency: "HUF" },
      description: `${artist.name} élőben: ${e.title}. Az adatok nyilvános forrásból származnak.`,
      image: artist.images.avatar,
      status: e.soldout ? "soldout" : "published",
    });
  }
  console.log("Események létrehozva:", EVENTS.length);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
