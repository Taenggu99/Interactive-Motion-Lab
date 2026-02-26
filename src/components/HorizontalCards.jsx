import { useMemo } from "react";
import CardShell from "./cards/CardShell.jsx";
import MagneticBalls from "./cards/MagneticBalls.jsx";
import BubblePop from "./cards/BubblePop.jsx";
import ElasticBlob from "./cards/ElasticBlob.jsx";
import TetrisDrop from "./cards/TetrisDrop.jsx";
import GooeyLiquid from "./cards/GooeyLiquid.jsx";
import GravitySandbox from "./cards/GravitySandbox.jsx";

export default function HorizontalCards() {
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
      {
        id: "gooey",
        title: "Gooey Liquid",
        subtitle: "서로 합쳐지는 끈적한 액체 효과(SVG Filter)",
        component: <GooeyLiquid />,
      },
      {
        id: "gravity",
        title: "Gravity Sandbox",
        subtitle: "중력과 충돌이 있는 물리 시뮬레이션",
        component: <GravitySandbox />,
      },
    ],
    []
  );

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-xl font-semibold tracking-tight">Motion Cards</h2>
        <p className="mt-2 text-zinc-300">
          다양한 인터랙티브 모션 컴포넌트들을 확인해보세요.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div key={c.id} className="h-[400px]">
              <CardShell title={c.title} subtitle={c.subtitle}>
                {c.component}
              </CardShell>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
