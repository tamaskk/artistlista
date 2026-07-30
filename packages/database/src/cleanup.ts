/**
 * Kamu (demó) adatok törlése — csak a valós, feltöltött előadók maradnak.
 * Megtartja: az 5 valós előadót (seed-real), az eseményeiket, az általuk
 * használt helyszíneket, és minden user/organization fiókot (admin belépés).
 * Futtatás: pnpm --filter @artistlist/database cleanup
 */
import { connectDB } from "./connect";
import { Artist } from "./models/artist";
import { Event } from "./models/event";
import { Venue } from "./models/venue";

const REAL_SLUGS = [
  "azahriah", "carson-coma", "dzsudlo", "desh", "wellhello",
  "valmar", "t-danny", "belano", "manuel", "kkevin", "vzs", "ekhoe", "grasa",
  "shyb-5-star", "mollywood", "hazetomika", "buda", "bruno-x-spacc",
  "k-osz-disco", "pumped-gabo", "stadiumx", "beton-hofi", "mehringer", "bsw",
  "halott-penz", "pogany-indulo", "otvar-pestis", "asan-budapest",
  "byealex-es-a-slepp", "molnar-tamas",
];

async function main() {
  await connectDB();

  const realArtists = await Artist.find({ slug: { $in: REAL_SLUGS } }).select("_id").lean();
  const realIds = realArtists.map((a) => a._id);
  if (realIds.length === 0) {
    throw new Error("Nincs valós előadó — futtasd előbb: pnpm seed:real");
  }

  // 1. töröljük az összes eseményt, ami NEM valós előadóhoz tartozik
  const evDel = await Event.deleteMany({ artistIds: { $nin: realIds } });
  console.log("Kamu események törölve:", evDel.deletedCount);

  // 2. töröljük a nem-valós előadókat
  const arDel = await Artist.deleteMany({ slug: { $nin: REAL_SLUGS } });
  console.log("Kamu előadók törölve:", arDel.deletedCount);

  // 3. töröljük a helyszíneket, amiket egyetlen megmaradt esemény sem használ
  const usedVenueIds = await Event.distinct("venueId");
  const veDel = await Venue.deleteMany({ _id: { $nin: usedVenueIds } });
  console.log("Használaton kívüli helyszínek törölve:", veDel.deletedCount);

  const counts = {
    artists: await Artist.countDocuments(),
    events: await Event.countDocuments(),
    venues: await Venue.countDocuments(),
  };
  console.log("Megmaradt:", counts);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
