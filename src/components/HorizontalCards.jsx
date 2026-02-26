import { useEffect, useMemo, useRef } from "react";
import CardShell from "./cards/CardShell.jsx";
import MagneticBalls from "./cards/MagneticBalls.jsx";
import BubblePop from "./cards/BubblePop.jsx";
import ElasticBlob from "./cards/ElasticBlob.jsx";
import TetrisDrop from "./cards/TetrisDrop.jsx";

export default function HorizontalCards() {
  const scrollerRef = useRef(null);

  const cards = useMemo(
    () => [
      {
        id: "magnetic",
        title: "Magnetic Balls",
        subtitle: "마우스에 반응하는 공(물리/파티클)",
        component: <MagneticBalls />,
      },
      {
        id: "elastic",
        title: "Elastic Blob",
        subtitle: "늘어나는 젤리 도형(Canvas/Soft-body)",
        component: <ElasticBlob />,
      },
      {
        id: "bubble",
        title: "Bubble Pop",
        subtitle: "클릭하면 버블이 생성되고 팡!",
        component: <BubblePop />,
      },
      {
        id: "tetris",
        title: "Tetris Drop",
        subtitle: "클릭으로 생성 + 라인 삭제 + 점수/다음블록",
        component: <TetrisDrop />,
      },
    ],
    []
  );

  // 스크롤휠 감지시 세로 스크롤을 가로 스크롤로 인식
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-xl font-semibold tracking-tight">Motion Cards</h2>
        <p className="mt-2 text-zinc-300">
          트랙패드/휠로 좌우 스크롤 해보세요. (scroll-snap 적용)
        </p>
      </div>

      <div
        ref={scrollerRef}
        className="mt-6 flex gap-5 overflow-x-auto px-6 pb-8
                   snap-x snap-mandatory scroll-smooth
                   [scrollbar-width:thin]"
      >
        {cards.map((c) => (
          <div
            key={c.id}
            className="snap-center shrink-0 w-[86vw] sm:w-[520px] md:w-[600px]"
          >
            <CardShell title={c.title} subtitle={c.subtitle}>
              {c.component}
            </CardShell>
          </div>
        ))}
      </div>
    </section>
  );
}
