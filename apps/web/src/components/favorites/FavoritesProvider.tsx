"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getFavorites } from "@/lib/favorites";

const LS_KEY = "artistlist:favorites";

type Kind = "city" | "genre";

interface FavCtx {
  ready: boolean;
  loggedIn: boolean;
  favSlugs: string[];
  isFav: (slug: string) => boolean;
  toggleFav: (slug: string) => void;
  isFollowing: (id: string) => boolean;
  toggleFollow: (id: string) => void;
  followedCities: string[];
  followedGenres: string[];
  isFollowingTag: (kind: Kind, value: string) => boolean;
  toggleTagFollow: (kind: Kind, value: string) => void;
}

const Ctx = createContext<FavCtx | null>(null);

export function useFavorites(): FavCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFavorites csak FavoritesProvider-en belül");
  return c;
}

function postLike(slug: string, liked: boolean) {
  fetch("/api/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, liked }),
    keepalive: true,
  }).catch(() => {});
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [follows, setFollows] = useState<Set<string>>(new Set());
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [genres, setGenres] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.loggedIn) {
          setLoggedIn(true);
          const serverFavs = new Set<string>(d.favorites ?? []);
          // vendég-localStorage összeolvasztása a fiókba (egyszer), majd törlés
          const local = getFavorites().filter((s) => !serverFavs.has(s));
          if (local.length) {
            local.forEach((s) => serverFavs.add(s));
            fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ merge: local }),
            }).catch(() => {});
          }
          try {
            localStorage.removeItem(LS_KEY);
          } catch {
            /* noop */
          }
          setFavs(serverFavs);
          setFollows(new Set<string>(d.follows ?? []));
          setCities(new Set<string>(d.cities ?? []));
          setGenres(new Set<string>(d.genres ?? []));
        } else {
          setFavs(new Set(getFavorites()));
        }
        setReady(true);
      })
      .catch(() => {
        setFavs(new Set(getFavorites()));
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFav = useCallback(
    (slug: string) => {
      setFavs((prev) => {
        const next = new Set(prev);
        const added = !next.has(slug);
        if (added) next.add(slug);
        else next.delete(slug);
        postLike(slug, added);
        if (loggedIn) {
          fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, on: added }),
          }).catch(() => {});
        } else {
          try {
            localStorage.setItem(LS_KEY, JSON.stringify([...next]));
          } catch {
            /* noop */
          }
        }
        return next;
      });
      window.dispatchEvent(new CustomEvent("favorites-changed"));
    },
    [loggedIn],
  );

  const toggleFollow = useCallback(
    (id: string) => {
      if (!loggedIn) {
        const from =
          typeof window !== "undefined" ? window.location.pathname : "/eloadok";
        router.push(`/belepes?from=${encodeURIComponent(from)}`);
        return;
      }
      setFollows((prev) => {
        const next = new Set(prev);
        const on = !next.has(id);
        if (on) next.add(id);
        else next.delete(id);
        fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artistId: id, on }),
        }).catch(() => {});
        return next;
      });
    },
    [loggedIn, router],
  );

  const toggleTagFollow = useCallback(
    (kind: Kind, value: string) => {
      if (!loggedIn) {
        const from = typeof window !== "undefined" ? window.location.pathname : "/neked";
        router.push(`/belepes?from=${encodeURIComponent(from)}`);
        return;
      }
      const setFn = kind === "city" ? setCities : setGenres;
      setFn((prev) => {
        const next = new Set(prev);
        const on = !next.has(value);
        if (on) next.add(value);
        else next.delete(value);
        fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, value, on }),
        }).catch(() => {});
        return next;
      });
    },
    [loggedIn, router],
  );

  return (
    <Ctx.Provider
      value={{
        ready,
        loggedIn,
        favSlugs: [...favs],
        isFav: (s) => favs.has(s),
        toggleFav,
        isFollowing: (id) => follows.has(id),
        toggleFollow,
        followedCities: [...cities],
        followedGenres: [...genres],
        isFollowingTag: (kind, value) => (kind === "city" ? cities : genres).has(value),
        toggleTagFollow,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
