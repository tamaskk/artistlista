import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";

export default function NotFound() {
  return (
    <PageFrame>
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <h1 className="font-display text-4xl font-bold">Nincs ilyen oldal</h1>
        <Link href="/" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
          Vissza a főoldalra
        </Link>
      </div>
    </PageFrame>
  );
}
