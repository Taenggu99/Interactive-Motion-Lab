import { useEffect, useRef } from "react";

export default function ElasticBlob() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // 점 개수(매끈함)
    const N = 100;

    const points = [];
    const center = { x: 0, y: 0 };
    const base = { r: 0 };

    // 물리 파라미터
    const physics = {
      damping: 0.90,
      spring: 0.085,
      neighborSpring: 0.24,

      dragSpanRatio: 0.22,
      dragForce: 0.048,

      // 목 얇아짐(살짝만)
      neckThin: 0.16,

      // 평상시 일렁임(기본 반지름에 미세 파동)
      wobbleAmp: 0.10, // 10%
      wobbleSpeed: 0.0096,
    };

    // 드래그 상태
    const drag = {
      active: false,
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      grabbedIndex: 0,
      strength: 0,

      // “꺾임 방지”를 위한 제약 축(잡은 지점의 초기 방향)
      dirX: 1,
      dirY: 0,
    };

    const initBlob = () => {
      center.x = width / 2;
      center.y = height / 2;
      base.r = Math.min(width, height) * 0.22;

      points.length = 0;
      for (let i = 0; i < N; i++) {
        const a = (Math.PI * 2 * i) / N;
        points.push({
          a,
          x: center.x + Math.cos(a) * base.r,
          y: center.y + Math.sin(a) * base.r,
          vx: 0,
          vy: 0,
          r0: base.r * (0.99 + Math.random() * 0.02),
        });
      }
    };

    initBlob();

    const getNearestPointIndex = (x, y) => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = x - p.x;
        const dy = y - p.y;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };

    const setPointerPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      drag.tx = e.clientX - rect.left;
      drag.ty = e.clientY - rect.top;
    };

    // 가우시안 가중치(드래그가 넓게 퍼져서 뾰족함 방지)
    const gaussianWeight = (t) => {
      const k = 4.6;
      return Math.exp(-k * t * t);
    };

    //  “중간 넘어가지 않게 + 눌리는 느낌” 제약 적용
    const applyDragConstraint = (rawX, rawY) => {
      const px = rawX - center.x;
      const py = rawY - center.y;

      // 잡은 축(초기 방향)으로의 투영(앞/뒤)
      const proj = px * drag.dirX + py * drag.dirY;

      // 축에 수직인 성분(옆으로 새는 값) — 꺾임 방지로 제한
      const perpX = px - proj * drag.dirX;
      const perpY = py - proj * drag.dirY;

      // 최대 당김(멀리 못 가게)
      const maxPull = Math.min(width, height) * 0.9;

      // “중간 지점” 같은 역할: 이 값보다 뒤로(반대 방향) 넘어가면 꺾임 느낌이 남
      // 오른쪽을 잡고 왼쪽으로 당길 때, proj가 음수가 되기 시작하는 구간을 막아줌
      const minProj = base.r * 0.3; // 여기서 더 낮추면 더 왼쪽까지 당겨짐, 올리면 더 빨리 '눌림'

      // 1) 앞쪽(당기는 방향)은 maxPull까지 허용
      let newProj = Math.min(proj, maxPull);

      // 2) 뒤쪽(반대로 넘기려는 방향)은 “클램프”가 아니라 “눌림(압축)”으로 처리
      // newProj가 minProj 아래로 내려가려 하면 더 내려가지 않게, 대신 천천히만(스퀴시)
      if (newProj < minProj) {
        const over = minProj - newProj; // 얼마나 넘었나
        newProj = minProj - over * 0.18; // 18%만 반영 → 눌리는 느낌
      }

      // 3) 옆으로 새는(perp) 값도 제한해서 꺾이는 느낌 줄이기
      const perpLimit = base.r * 0.55;
      const perpLen = Math.hypot(perpX, perpY);
      let k = 1;
      if (perpLen > perpLimit) k = perpLimit / perpLen;

      const finalX =
        center.x + newProj * drag.dirX + perpX * k;
      const finalY =
        center.y + newProj * drag.dirY + perpY * k;

      return { x: finalX, y: finalY };
    };

    const onPointerDown = (e) => {
      drag.active = true;
      setPointerPos(e);
      drag.x = drag.tx;
      drag.y = drag.ty;

      drag.grabbedIndex = getNearestPointIndex(drag.x, drag.y);

      // 잡은 지점의 “초기 방향” 저장(제약 축)
      const gp = points[drag.grabbedIndex];
      const dx = gp.x - center.x;
      const dy = gp.y - center.y;
      const len = Math.hypot(dx, dy) || 1;
      drag.dirX = dx / len;
      drag.dirY = dy / len;

      canvas.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!drag.active) return;
      setPointerPos(e);
    };

    const endDrag = () => {
      drag.active = false;
    };

    const onResize = () => {
      resize();
      initBlob();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", endDrag);
    window.addEventListener("resize", onResize);
    canvas.style.touchAction = "none";

    const applyPhysics = (now) => {
      // 드래그 포인트도 쫀득하게 따라오기
      drag.x = lerp(drag.x, drag.tx, 0.14);
      drag.y = lerp(drag.y, drag.ty, 0.14);

      // 제약 적용된 “실제 목표 드래그 위치”
      const constrained = drag.active
        ? applyDragConstraint(drag.x, drag.y)
        : null;

      // 드래그 강도(0~1)
      const dxC = (constrained ? constrained.x : drag.x) - center.x;
      const dyC = (constrained ? constrained.y : drag.y) - center.y;
      const distC = Math.hypot(dxC, dyC);
      const maxPull = Math.min(width, height) * 0.55;
      drag.strength = drag.active ? clamp(distC / maxPull, 0, 1) : 0;

      // 기본 스프링 + 이웃 스프링 +  idle wobble(평상시 일렁)
      for (let i = 0; i < N; i++) {
        const p = points[i];

        // idle wobble: 각 점별로 약간 다른 위상으로 반지름에 미세 파동
        const wobble =
          1 +
          physics.wobbleAmp *
          (Math.sin(now * physics.wobbleSpeed + i * 0.65) * 0.65 +
            Math.sin(now * (physics.wobbleSpeed * 0.72) + i * 1.15) * 0.35);

        const rr = p.r0 * wobble;

        const rx = center.x + Math.cos(p.a) * rr;
        const ry = center.y + Math.sin(p.a) * rr;

        p.vx += (rx - p.x) * physics.spring;
        p.vy += (ry - p.y) * physics.spring;

        const prev = points[(i - 1 + N) % N];
        const next = points[(i + 1) % N];

        p.vx += (prev.x - p.x) * physics.neighborSpring * 0.5;
        p.vy += (prev.y - p.y) * physics.neighborSpring * 0.5;
        p.vx += (next.x - p.x) * physics.neighborSpring * 0.5;
        p.vy += (next.y - p.y) * physics.neighborSpring * 0.5;
      }

      // 드래그 영향(넓게 + 둥글게)
      if (drag.active && constrained) {
        const span = Math.max(3, Math.floor(N * physics.dragSpanRatio));

        for (let i = 0; i < N; i++) {
          const p = points[i];
          const diRaw = Math.abs(i - drag.grabbedIndex);
          const di = Math.min(diRaw, N - diRaw);
          if (di > span) continue;

          const t = di / span;
          const w = gaussianWeight(t);

          // 제약된 위치로 끌어당김(꺾임 줄고 “눌림” 느낌 살아남)
          p.vx += (constrained.x - p.x) * physics.dragForce * w;
          p.vy += (constrained.y - p.y) * physics.dragForce * w;

          // 목 얇아짐은 살짝만 (너무 하면 날카로움/꺾임 증가)
          if (drag.strength > 0) {
            const oppositeIndex = (drag.grabbedIndex + Math.floor(N / 2)) % N;
            const dOppRaw = Math.abs(i - oppositeIndex);
            const dOpp = Math.min(dOppRaw, N - dOppRaw);
            if (dOpp <= span) {
              const tOpp = dOpp / span;
              const wOpp = gaussianWeight(tOpp);

              const toCx = center.x - p.x;
              const toCy = center.y - p.y;

              p.vx += toCx * physics.neckThin * drag.strength * 0.012 * wOpp;
              p.vy += toCy * physics.neckThin * drag.strength * 0.012 * wOpp;
            }
          }
        }
      }

      // 속도 적용 + 감쇠
      for (let i = 0; i < N; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= physics.damping;
        p.vy *= physics.damping;
      }
    };

    const drawBlob = () => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const p0 = points[i];
        const p1 = points[(i + 1) % N];
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        if (i === 0) ctx.moveTo(mx, my);
        ctx.quadraticCurveTo(p1.x, p1.y, mx, my);
      }
      ctx.closePath();

      ctx.fillStyle = "rgba(228, 228, 231, 0.10)";
      ctx.fill();

      ctx.strokeStyle = "rgba(228, 228, 231, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = "rgba(228, 228, 231, 0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const loop = (now) => {
      ctx.clearRect(0, 0, width, height);

      applyPhysics(now);
      drawBlob();

      ctx.fillStyle = "rgba(228, 228, 231, 0.55)";
      ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Idle wobble + press limit (squish) ✨", 14, 20);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      canvas.removeEventListener("pointerleave", endDrag);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
