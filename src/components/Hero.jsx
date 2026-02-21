export default function Hero() {
 return (
   <section className="pt-16 pb-10">
     <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
       Interactive Motion Lab
     </h1>

     <p className="mt-4 text-zinc-300 leading-relaxed max-w-2xl">
       한 페이지 안에서 다양한 인터랙션을 실험하는 React 포트폴리오.
       <br />
       좌우 스크롤 카드마다 서로 다른 테마(공/버블/젤리)를 넣어 “움직이는 경험”을
       보여줘요.
     </p>

     <div className="mt-6 flex flex-wrap gap-2">
       {["React", "Vite", "Tailwind", "Canvas/SVG"].map((t) => (
         <span
           key={t}
           className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-sm text-zinc-200"
         >
           {t}
         </span>
       ))}
     </div>
   </section>
 );
}
