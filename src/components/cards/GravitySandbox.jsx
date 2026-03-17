import { useEffect, useRef } from "react";

export default function GravitySandbox() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const clumpsRef = useRef([]);
    const gridRef = useRef([]);

    const colsRef = useRef(0);
    const rowsRef = useRef(0);

    // 내부 시뮬레이션 좌표계 고정
    const WORLD_WIDTH = 960;
    const WORLD_HEIGHT = 600;
    const cellSize = 4;

    const dprRef = useRef(1);
    const viewportRef = useRef({
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        scaleX: 1,
        scaleY: 1,
    });

    const createGrid = () => {
        const cols = Math.floor(WORLD_WIDTH / cellSize);
        const rows = Math.floor(WORLD_HEIGHT / cellSize);

        colsRef.current = cols;
        rowsRef.current = rows;

        return Array.from({ length: rows }, () => Array(cols).fill(null));
    };

    const inBounds = (x, y) => {
        return x >= 0 && x < colsRef.current && y >= 0 && y < rowsRef.current;
    };

    const isEmpty = (x, y) => {
        if (!inBounds(x, y)) return false;
        return gridRef.current[y][x] === null;
    };

    const setSand = (x, y, color) => {
        if (!inBounds(x, y)) return;

        gridRef.current[y][x] = {
            color,
            settledAt: performance.now(),
        };
    };

    const spawnClump = (x, y) => {
        const radius = 14 + Math.random() * 18;

        clumpsRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 2,
            radius,
            color: `hsl(${Math.random() * 40 + 25},70%,58%)`,
        });
    };

    const breakClumpIntoSand = (clump) => {
        const centerX = Math.floor(clump.x / cellSize);
        const centerY = Math.floor(clump.y / cellSize);
        const r = Math.max(2, Math.floor(clump.radius / cellSize));

        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= r) {
                    const gx = centerX + dx;
                    const gy = centerY + dy;

                    if (isEmpty(gx, gy)) {
                        setSand(gx, gy, clump.color);
                    }
                }
            }
        }
    };

    const getWorldPointer = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        const { width, height } = viewportRef.current;

        return {
            x: (localX / rect.width) * width,
            y: (localY / rect.height) * height,
        };
    };

    const handleCanvasClick = (e) => {
        const { x, y } = getWorldPointer(e);
        spawnClump(x, y);
    };

    useEffect(() => {
        gridRef.current = createGrid();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let animationFrameId;

        const updateSand = (now) => {
            const grid = gridRef.current;

            for (let y = rowsRef.current - 2; y >= 0; y--) {
                for (let x = 0; x < colsRef.current; x++) {
                    const sand = grid[y][x];
                    if (!sand) continue;

                    const age = now - sand.settledAt;

                    if (age > 3000 && Math.random() > 0.01) continue;

                    if (isEmpty(x, y + 1)) {
                        grid[y + 1][x] = { ...sand, settledAt: now };
                        grid[y][x] = null;
                        continue;
                    }

                    const dirFirst = Math.random() < 0.5 ? -1 : 1;
                    const dirSecond = -dirFirst;

                    if (isEmpty(x + dirFirst, y + 1)) {
                        grid[y + 1][x + dirFirst] = { ...sand, settledAt: now };
                        grid[y][x] = null;
                        continue;
                    }

                    if (isEmpty(x + dirSecond, y + 1)) {
                        grid[y + 1][x + dirSecond] = { ...sand, settledAt: now };
                        grid[y][x] = null;
                    }
                }
            }
        };

        const updateClumps = () => {
            const gravity = 0.35;
            const airFriction = 0.995;
            const bounce = 0.12;

            clumpsRef.current = clumpsRef.current.filter((clump) => {
                clump.vy += gravity;
                clump.vx *= airFriction;
                clump.vy *= airFriction;

                clump.x += clump.vx;
                clump.y += clump.vy;

                if (clump.x - clump.radius < 0) {
                    clump.x = clump.radius;
                    clump.vx *= -bounce;
                }

                if (clump.x + clump.radius > WORLD_WIDTH) {
                    clump.x = WORLD_WIDTH - clump.radius;
                    clump.vx *= -bounce;
                }

                if (clump.y - clump.radius < 0) {
                    clump.y = clump.radius;
                    clump.vy *= -bounce;
                }

                if (clump.y + clump.radius >= WORLD_HEIGHT) {
                    clump.y = WORLD_HEIGHT - clump.radius;
                    breakClumpIntoSand(clump);
                    return false;
                }

                const checkX = Math.floor(clump.x / cellSize);
                const checkY = Math.floor((clump.y + clump.radius) / cellSize);

                if (inBounds(checkX, checkY) && !isEmpty(checkX, checkY)) {
                    breakClumpIntoSand(clump);
                    return false;
                }

                return true;
            });
        };

        const drawSand = (ctx) => {
            const grid = gridRef.current;

            for (let y = 0; y < rowsRef.current; y++) {
                for (let x = 0; x < colsRef.current; x++) {
                    const sand = grid[y][x];
                    if (!sand) continue;

                    ctx.fillStyle = sand.color;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        };

        const drawClumps = (ctx) => {
            clumpsRef.current.forEach((clump) => {
                ctx.beginPath();
                ctx.arc(clump.x, clump.y, clump.radius, 0, Math.PI * 2);
                ctx.fillStyle = clump.color;
                ctx.fill();
            });
        };

        const drawOverlay = (ctx) => {
            ctx.fillStyle = "rgba(228, 228, 231, 0.7)";
            ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
            ctx.fillText("클릭하면 모래 덩어리가 떨어져요", 14, 20);

            ctx.fillStyle = "rgba(228, 228, 231, 0.45)";
            ctx.font = "11px system-ui, -apple-system, Segoe UI, Roboto";
            ctx.fillText(
                "바닥이나 다른 모래에 닿으면 파사삭 부서져 쌓입니다",
                14,
                38
            );
        };

        const update = (now) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const { width, height } = viewportRef.current;

            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = "rgb(24, 24, 27)";
            ctx.fillRect(0, 0, width, height);

            updateClumps();
            updateSand(now);

            drawSand(ctx);
            drawClumps(ctx);
            drawOverlay(ctx);

            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    useEffect(() => {
        const container = containerRef.current;

        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas || !container) return;

            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            dprRef.current = dpr;

            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);

            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext("2d");
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            const scaleX = rect.width / WORLD_WIDTH;
            const scaleY = rect.height / WORLD_HEIGHT;

            viewportRef.current = {
                width: WORLD_WIDTH,
                height: WORLD_HEIGHT,
                scaleX,
                scaleY,
            };

            ctx.scale(scaleX, scaleY);
        };

        resizeCanvas();

        const resizeObserver = new ResizeObserver(() => {
            resizeCanvas();
        });

        if (container) {
            resizeObserver.observe(container);
        }
        window.addEventListener("resize", resizeCanvas);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full bg-zinc-900 overflow-hidden">
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair block"
            />
        </div>
    );
}
