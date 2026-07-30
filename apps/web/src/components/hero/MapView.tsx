"use client";

import maplibregl, { type Map as MLMap, type Marker } from "maplibre-gl";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDateBadge, formatEventDate, formatPrice, formatTime } from "@artistlist/types";
import type { PublicEventCard } from "@/lib/public-types";
import { Thumb } from "../Thumb";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const STYLE_URL = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/dataviz-light/style.json?key=${MAPTILER_KEY}`
  : "https://tiles.openfreemap.org/styles/positron";

// Magyarország-központú kezdőnézet — az események országszerte (sőt SK/RO)
// vannak, ezért nem Budapestre, hanem az egész országra zoomolunk.
const HU_CENTER: [number, number] = [19.4, 47.1];
const HU_ZOOM = 6.4;
const HU_BBOX: [number, number, number, number] = [16.0, 45.5, 23.0, 48.7];

/** Fotókártyás pin DOM-eleme (kép + cím + tüske). */
const PLACEHOLDER_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B8FB0" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';

function buildCardEl(
  ev: PublicEventCard,
  extra: number,
  promoTier: number,
  onClick: () => void,
): HTMLDivElement {
  // FONTOS: a marker gyökér-elemére a MapLibre `transform`-ot rak a
  // pozicionáláshoz — ezért ezen SOHA nincs saját transform/transition,
  // különben a pin lemaradva "úszik" a térkép mozgása közben. A hover-skálát
  // egy belső wrapper kapja.
  const el = document.createElement("div");
  el.className = "map-marker";
  el.dataset.eventId = ev.id;
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute(
    "aria-label",
    `${ev.artistNames[0] ?? ev.title} — ${ev.venueName}${extra > 0 ? `, és további ${extra}` : ""}`,
  );

  const card = document.createElement("div");
  card.className = extra > 0 ? "map-card map-card-stack" : "map-card";
  if (promoTier > 0) card.classList.add("map-card-promoted");

  const inner = document.createElement("div");
  inner.className = "map-card-inner";

  if (promoTier > 0) {
    const crown = document.createElement("span");
    crown.className = "map-card-crown";
    crown.textContent = "★";
    card.appendChild(crown);
  }

  const thumb = document.createElement("div");
  thumb.className = "map-card-thumb map-card-thumb-placeholder";
  thumb.innerHTML = PLACEHOLDER_SVG;
  if (ev.image) {
    // háttérkép csak sikeres betöltés után — hibás URL → marad a placeholder
    const probe = new Image();
    probe.onload = () => {
      thumb.style.backgroundImage = `url("${ev.image}")`;
      thumb.classList.remove("map-card-thumb-placeholder");
      thumb.querySelector("svg")?.remove();
    };
    probe.src = ev.image;
  }
  const badge = document.createElement("span");
  badge.className = "map-card-badge";
  badge.textContent = formatDateBadge(ev.startsAt);
  thumb.appendChild(badge);

  if (extra > 0) {
    const more = document.createElement("span");
    more.className = "map-card-more";
    more.textContent = `+${extra}`;
    thumb.appendChild(more);
  }

  const title = document.createElement("div");
  title.className = "map-card-title";
  title.textContent = ev.artistNames[0] ?? ev.title;

  inner.appendChild(thumb);
  inner.appendChild(title);

  const tail = document.createElement("div");
  tail.className = "map-card-tail";

  card.appendChild(inner);
  card.appendChild(tail);
  el.appendChild(card);
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  });
  return el;
}

export function MapView({
  events,
  hoveredId,
  onBboxChange,
}: {
  events: PublicEventCard[];
  hoveredId: string | null;
  onBboxChange: (bbox: [number, number, number, number]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalGroup, setModalGroup] = useState<PublicEventCard[] | null>(null);
  const [, setTick] = useState(0); // popup-pozíció követése mozgás közben
  const [mapError, setMapError] = useState(false);
  const bboxCb = useRef(onBboxChange);
  bboxCb.current = onBboxChange;
  const selectRef = useRef(setSelectedId);
  selectRef.current = setSelectedId;
  const modalRef = useRef(setModalGroup);
  modalRef.current = setModalGroup;

  /** Markerek teljes újraépítése az `events` propból (azonos koord → legyező). */
  const rebuildMarkers = useCallback((list: PublicEventCard[]) => {
    const map = mapRef.current;
    if (!map) return;
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    // csoportosítás pontos koordináta szerint
    const groups = new Map<string, PublicEventCard[]>();
    for (const ev of list) {
      if (!ev.lng || !ev.lat) continue;
      const key = `${ev.lng.toFixed(4)},${ev.lat.toFixed(4)}`;
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(ev);
    }

    for (const [, group] of groups) {
      // kiemelt (fizetős) elöl, aztán időrend — a "fő" kártya a legfelső
      group.sort(
        (a, b) =>
          (b.promoTier ?? 0) - (a.promoTier ?? 0) ||
          +new Date(a.startsAt) - +new Date(b.startsAt),
      );
      const head = group[0];
      const promoTier = Math.max(0, ...group.map((e) => e.promoTier ?? 0));
      const stack = group.slice(); // click-closure számára rögzítjük
      const el = buildCardEl(head, group.length - 1, promoTier, () => {
        if (stack.length > 1) {
          selectRef.current(null);
          modalRef.current(stack); // több esemény → modal
        } else {
          modalRef.current(null);
          selectRef.current(head.id); // egy esemény → mini-kártya
        }
      });
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([head.lng, head.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let map: MLMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: HU_CENTER,
        zoom: HU_ZOOM,
        attributionControl: { compact: true },
      });
    } catch (e) {
      // pl. headless / WebGL nélküli környezet — a lista térkép nélkül is működjön
      console.warn("[MapView] a térkép nem inicializálható:", e);
      setMapError(true);
      bboxCb.current(HU_BBOX);
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
    map.addControl(new maplibregl.FullscreenControl(), "bottom-left");
    map.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }),
      "bottom-left",
    );

    map.on("load", () => {
      map.on("click", () => selectRef.current(null)); // canvas-katt → popup zár
      setReady(true);
      const b = map.getBounds();
      bboxCb.current([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    });

    let t: ReturnType<typeof setTimeout>;
    map.on("moveend", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const b = map.getBounds();
        bboxCb.current([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      }, 400);
    });
    map.on("move", () => setTick((n) => n + 1));

    return () => {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // markerek frissítése amikor jön az adat vagy betölt a térkép
  useEffect(() => {
    if (!ready) return;
    rebuildMarkers(events);
  }, [events, ready, rebuildMarkers]);

  // lista-hover + kiválasztás → kártya-kiemelés CSS-osztállyal
  useEffect(() => {
    if (!ready) return;
    for (const marker of markersRef.current) {
      const el = marker.getElement();
      const id = el.dataset.eventId;
      el.classList.toggle("map-card-hovered", id === hoveredId);
      el.classList.toggle("map-card-selected", id === selectedId);
    }
  }, [hoveredId, selectedId, ready, events]);

  // kiválasztott eseményre finom ráközelítés (smooth flyTo)
  useEffect(() => {
    if (!ready || !selectedId) return;
    const map = mapRef.current;
    const ev = events.find((e) => e.id === selectedId);
    if (!map || !ev) return;
    map.flyTo({
      center: [ev.lng, ev.lat],
      zoom: Math.max(map.getZoom(), 11.5),
      duration: 700,
      essential: true,
    });
  }, [selectedId, ready, events]);

  const selected = selectedId ? events.find((e) => e.id === selectedId) : null;
  const selectedPoint =
    selected && mapRef.current ? mapRef.current.project([selected.lng, selected.lat]) : null;

  if (mapError) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-[#F4F5F9] text-sm text-muted">
        A térkép nem érhető el ebben a böngészőben — használd a listát.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#F4F5F9]">
      <div ref={containerRef} className="h-full w-full" />
      {selected && selectedPoint && (
        <div
          className="pointer-events-none absolute z-20"
          style={{ left: selectedPoint.x, top: selectedPoint.y }}
        >
          <div className="pin-glow pointer-events-none absolute left-0 top-0 h-[130px] w-[130px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.5)_0%,rgba(139,92,246,0.22)_45%,rgba(139,92,246,0)_70%)]" />
          <div className="pointer-events-auto absolute bottom-[112px] left-0 w-[264px] -translate-x-1/2 rounded-2xl bg-surface p-3 shadow-pop ring-1 ring-glow/15">
            <div className="flex gap-3">
              <Thumb
                src={selected.image}
                alt={selected.title}
                label="fotó"
                className="h-[60px] w-[60px] shrink-0 rounded-[10px]"
              />
              <div className="min-w-0">
                <div className="truncate text-[14.5px] font-bold leading-tight">
                  {selected.artistNames[0] ?? selected.title}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted">
                  {selected.venueName} · {selected.city}
                </div>
                <div className="mt-0.5 text-xs text-muted">{formatEventDate(selected.startsAt)}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {selected.price.kind === "free"
                      ? "Ingyenes"
                      : selected.price.kind === "paid"
                        ? formatPrice(selected.price)
                        : "Ár később"}
                  </span>
                  <Link
                    href={`/esemenyek/${selected.slug}`}
                    className="ml-auto text-xs font-semibold text-accent hover:text-accent-deep"
                  >
                    Részletek →
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-surface" />
          </div>
        </div>
      )}

      {modalGroup && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-ink/40 p-6"
          onClick={() => setModalGroup(null)}
        >
          <div
            className="max-h-full w-[380px] overflow-hidden rounded-2xl bg-surface shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <div className="text-[15px] font-bold">{modalGroup[0].venueName}</div>
                <div className="text-xs text-muted">
                  {modalGroup[0].city} · {modalGroup.length} esemény
                </div>
              </div>
              <button
                onClick={() => setModalGroup(null)}
                aria-label="Bezárás"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-chip hover:text-fg"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[380px] overflow-y-auto p-3">
              {modalGroup.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/esemenyek/${ev.slug}`}
                  className="flex gap-3 rounded-xl p-2 transition hover:bg-chip"
                >
                  <Thumb
                    src={ev.image}
                    alt={ev.title}
                    label="fotó"
                    className="h-[52px] w-[52px] shrink-0 rounded-[10px]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold">
                      {ev.artistNames[0] ?? ev.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {formatDateBadge(ev.startsAt)} · {formatTime(ev.startsAt)}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-ink-soft">
                      {ev.price.kind === "free"
                        ? "Ingyenes"
                        : ev.price.kind === "paid"
                          ? formatPrice(ev.price)
                          : "Ár később"}
                    </div>
                  </div>
                  <span className="self-center text-xs font-semibold text-accent">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
