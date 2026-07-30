import { slugify } from "@artistlist/types";

/**
 * Város → hozzávetőleges [lng, lat] középpont. Publikus beküldéskor az új
 * helyszín koordinátáját ebből becsüljük (a superadmin a moderációban pontosíthat).
 * Ismeretlen város → Budapest (fallback). Kulcsok: slugify(város).
 */
const CENTROIDS: Record<string, [number, number]> = {
  budapest: [19.0402, 47.4979],
  debrecen: [21.6273, 47.5316],
  szeged: [20.1414, 46.253],
  miskolc: [20.7784, 48.1035],
  pecs: [18.2325, 46.0727],
  gyor: [17.6504, 47.6875],
  nyiregyhaza: [21.7167, 47.9554],
  kecskemet: [19.6897, 46.9074],
  szekesfehervar: [18.4221, 47.1956],
  szombathely: [16.6218, 47.2307],
  veszprem: [17.9093, 47.0933],
  zalaegerszeg: [16.8416, 46.8417],
  sopron: [16.5845, 47.6817],
  eger: [20.3772, 47.9026],
  kaposvar: [17.7847, 46.3594],
  tatabanya: [18.4048, 47.5692],
  bekescsaba: [21.0873, 46.6786],
  salgotarjan: [19.8065, 48.0935],
  siofok: [18.058, 46.904],
  zamardi: [17.953, 46.883],
  balatonfured: [17.8869, 46.9591],
  keszthely: [17.2431, 46.7686],
  szolnok: [20.1904, 47.1747],
  dunaujvaros: [18.9355, 46.9619],
  hodmezovasarhely: [20.3299, 46.4181],
  nagykanizsa: [16.9917, 46.4531],
  baja: [18.9541, 46.1806],
  gyula: [21.2769, 46.6453],
  paks: [18.8564, 46.6217],
  tata: [18.3208, 47.6486],
  esztergom: [18.7404, 47.7856],
  vac: [19.1381, 47.7757],
  szigethalom: [19.0011, 47.3186],
  cegled: [19.7973, 47.1731],
  ozd: [20.29, 48.2206],
  nyirbator: [22.1281, 47.8394],
};

/** Város neve → [lng, lat]. Ismeretlen → Budapest. */
export function cityCentroid(city: string): [number, number] {
  return CENTROIDS[slugify(city)] ?? CENTROIDS.budapest;
}
