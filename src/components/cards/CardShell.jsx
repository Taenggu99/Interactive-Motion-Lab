export default function CardShell({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="mt-1 text-sm text-zinc-300">{subtitle}</div>
          </div>
          <span className="text-xs text-zinc-400 border border-zinc-800 rounded-full px-2 py-1 bg-zinc-950/40">
            demo
          </span>
        </div>
      </div>

      <div className="h-[340px] border-t border-zinc-800 bg-zinc-950">
        {children}
      </div>

      <div className="p-4 text-xs text-zinc-400">
        다음 단계에서 각 카드에 Canvas/SVG 인터랙션을 붙일 거예요.
      </div>
    </div>
  );
}
