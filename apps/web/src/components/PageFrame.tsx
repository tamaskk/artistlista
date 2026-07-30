import { Footer } from "./Footer";
import { Header } from "./Header";

/** A design "app-keret": levendula vászon, benne nagy lekerekített fehér kártya. */
export function PageFrame({ children, active }: { children: React.ReactNode; active?: string }) {
  return (
    <div className="flex min-h-screen justify-center bg-canvas p-4 md:p-10">
      <div className="w-full max-w-[1440px] rounded-frame bg-white px-5 pb-12 pt-8 shadow-frame md:px-12">
        <Header active={active} />
        {children}
        <Footer />
      </div>
    </div>
  );
}
