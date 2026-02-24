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
        maxLife: rand(45, 90), // 프레임 기준
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
      // 바깥 링
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(228, 228, 231, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // 하이라이트(빛 반사 느낌)
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(228, 228, 231, 0.18)";
      ctx.fill();
      ctx.closePath();
    };

    const drawParticle = (p) => {
      const t = p.life / p.maxLife; // 0→1
      const alpha = 1 - t;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(228, 228, 231, ${alpha})`;
      ctx.fill();
      ctx.closePath();
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      // 버블 업데이트
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life += 1;

        b.r += b.growth;
        b.x += b.vx;
        b.y += b.vy;

        // 화면 밖으로 살짝 나가면 자연스럽게 정리
        const out =
          b.x + b.r < -20 || b.x - b.r > width + 20 || b.y + b.r < -40 || b.y - b.r > height + 40;

        // 수명 다하면 팡
        if (b.life >= b.maxLife || out) {
          popBubble(b);
          bubbles.splice(i, 1);
          continue;
        }

        drawBubble(b);
      }

      // 파티클 업데이트
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;

        // 중력 + 감쇠
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
      ctx.fillText("Click to create bubbles ✨", 14, 20);

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 클릭 한 번에 여러 개 생기게 하면 더 “버블” 느낌
      const n = Math.random() < 0.4 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        addBubble(x + rand(-10, 10), y + rand(-10, 10));
      }
    };

    const onResize = () => resize();

    canvas.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
