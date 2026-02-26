import { useEffect, useRef } from "react";

class Ball {
    constructor(x, y, dx, dy, radius) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#e4e4e7";
        ctx.fill();
        ctx.closePath();
    }

    update(ctx, width, height, mouse) {
        // 벽 충돌
        if (this.x + this.radius > width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        // 마우스 반응 계산 
        if (mouse.current.x !== null && mouse.current.y !== null) {
            const dx = mouse.current.x - this.x;
            const dy = mouse.current.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0 && distance < 120) {
                const force = 120 - distance;
                this.dx -= (dx / distance) * force * 0.002;
                this.dy -= (dy / distance) * force * 0.002;
            }
        }

        this.x += this.dx;
        this.y += this.dy;

        // 감쇠
        this.dx *= 0.99;
        this.dy *= 0.99;

        this.draw(ctx);
    }
}

export default function MagneticBalls() {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const mouse = useRef({ x: null, y: null });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;

        canvas.width = width;
        canvas.height = height;

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current.x = e.clientX - rect.left;
            mouse.current.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.current.x = null;
            mouse.current.y = null;
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);

        const balls = [];
        for (let i = 0; i < 60; i++) {
            const radius = 3 + Math.random() * 4;
            const x = Math.random() * (width - radius * 2) + radius;
            const y = Math.random() * (height - radius * 2) + radius;
            const dx = (Math.random() - 0.5) * 1.5;
            const dy = (Math.random() - 0.5) * 1.5;
            balls.push(new Ball(x, y, dx, dy, radius));
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            balls.forEach((b) => b.update(ctx, width, height, mouse));
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationRef.current);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full" />;
}
