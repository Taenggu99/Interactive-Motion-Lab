import { useEffect, useRef } from "react";

export default function GravitySandbox() {
    const canvasRef = useRef(null);
    const ballsRef = useRef([]);
    const spawnBall = (x, y) => {
        const newBall = {
            x,
            y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            radius: 10 + Math.random() * 15,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        };
        ballsRef.current.push(newBall);
    };

    const handleCanvasClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        spawnBall(e.clientX - rect.left, e.clientY - rect.top);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gravity = 0.5;
            const friction = 0.98;
            const bounce = 0.7;

            ballsRef.current.forEach((ball) => {
                ball.vy += gravity;
                ball.vx *= friction;
                ball.vy *= friction;
                ball.x += ball.vx;
                ball.y += ball.vy;

                // Boundary checks
                if (ball.y + ball.radius > canvas.height) {
                    ball.y = canvas.height - ball.radius;
                    ball.vy *= -bounce;
                }
                if (ball.x + ball.radius > canvas.width) {
                    ball.x = canvas.width - ball.radius;
                    ball.vx *= -bounce;
                }
                if (ball.x - ball.radius < 0) {
                    ball.x = ball.radius;
                    ball.vx *= -bounce;
                }

                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = ball.color;
                ctx.fill();
                ctx.closePath();
            });

            animationFrameId = requestAnimationFrame(update);
        };

        update();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    useEffect(() => {
        const resizeCanvas = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.parentElement.getBoundingClientRect();
                canvasRef.current.width = rect.width;
                canvasRef.current.height = rect.height;
            }
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    return (
        <div className="relative w-full h-full bg-zinc-900 overflow-hidden">
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair"
            />
            <div className="absolute top-4 left-4 text-xs text-zinc-500 pointer-events-none">
                클릭하여 공을 생성하세요
            </div>
        </div>
    );
}
