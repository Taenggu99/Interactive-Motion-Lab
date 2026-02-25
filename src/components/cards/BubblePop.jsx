import { useEffect, useRef } from "react";

export default function BubblePop() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const bubbles = [];
    const particles = [];

    const rand = (min, max) => Math.random() * (max - min) + min;

    const addBubble = (x, y) => {
      bubbles.push({
        x,
        y,
        r: rand(10, 22),
        growth: rand(0.15, 0.35),
        vy: rand(-0.35, -0.8),
        vx: rand(-0.25, 0.25),
        life: 0,
        maxLife: rand(45, 90),
      });
    };

    const popBubble = (b) => {
      const count = Math.floor(rand(14, 22));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + rand(-0.2, 0.2);
        const speed = rand(1.2, 3.2);
        particles.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: rand(1.2, 2.4),
          life: 0,
          maxLife: rand(25, 45),
        });
      }
    };

    const drawBubble = (b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(228, 228, 231, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(
        b.x - b.r * 0.35,
        b.y - b.r * 0.35,
        b.r * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(228, 228, 231, 0.18)";
      ctx.fill();
      ctx.closePath();
    };

    const drawParticle = (p) => {
      const t = p.life / p.maxLife;
      const alpha = 1 - t;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(228, 228, 231, ${alpha})`;
      ctx.fill();
      ctx.closePath();
    };


    //  누르고 있는 동안 연속 생성 
    const isPressing = { current: false };
    const pressPos = { x: 0, y: 0 };
    let lastSpawnTime = 0;
    const SPAWN_INTERVAL_MS = 90;

    const setPointerPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      pressPos.x = e.clientX - rect.left;
      pressPos.y = e.clientY - rect.top;
    };

    const spawnBurst = (x, y) => {
      // 한 번 스폰할 때 1~2개 랜덤
      const n = Math.random() < 0.45 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        addBubble(x + rand(-10, 10), y + rand(-10, 10));
      }
    };

    const step = (now) => {
      ctx.clearRect(0, 0, width, height);

      // 누르고 있는 동안 일정 간격으로 계속 생성
      if (isPressing.current) {
        if (now - lastSpawnTime > SPAWN_INTERVAL_MS) {
          lastSpawnTime = now;
          spawnBurst(pressPos.x, pressPos.y);
        }
      }

      // 버블 업데이트 + 렌더
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life += 1;

        b.r += b.growth;
        b.x += b.vx;
        b.y += b.vy;

        const out =
          b.x + b.r < -20 ||
          b.x - b.r > width + 20 ||
          b.y + b.r < -40 ||
          b.y - b.r > height + 40;

        if (b.life >= b.maxLife || out) {
          popBubble(b);
          bubbles.splice(i, 1);
          continue;
        }

        drawBubble(b);
      }

      // 파티클 업데이트 + 렌더
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;

        p.vy += 0.03;
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        drawParticle(p);
      }

      // 안내 텍스트
      ctx.fillStyle = "rgba(228, 228, 231, 0.55)";
      ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Press & hold to spawn bubbles ✨", 14, 20);

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    // pointer 이벤트(마우스/터치 공용)
    const onPointerDown = (e) => {
      isPressing.current = true;
      setPointerPos(e);
      lastSpawnTime = performance.now() - SPAWN_INTERVAL_MS; // 누르자마자 바로 1번 생성되게
      canvas.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isPressing.current) return;
      setPointerPos(e);
    };

    const stopPress = () => {
      isPressing.current = false;
    };

    const onResize = () => resize();

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", stopPress);
    canvas.addEventListener("pointercancel", stopPress);
    canvas.addEventListener("pointerleave", stopPress);
    window.addEventListener("resize", onResize);

    // 스크롤/드래그 기본 동작 방지
    canvas.style.touchAction = "none";

    return () => {
      cancelAnimationFrame(rafRef.current);

      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", stopPress);
      canvas.removeEventListener("pointercancel", stopPress);
      canvas.removeEventListener("pointerleave", stopPress);

      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
