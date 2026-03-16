import { useEffect, useRef } from "react";

export default function GravitySandbox() {
    const canvasRef = useRef(null);
    const clumpsRef = useRef([]);
    const gridRef = useRef([]);
    const colsRef = useRef(0);
    const rowsRef = useRef(0);

    const cellSize = 4;

    const randomRange = (min, max) => Math.random() * (max - min) + min;

    const createGrid = (width, height) => {
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);

        colsRef.current = cols;
        rowsRef.current = rows;
        gridRef.current = Array.from({ length: rows }, () => Array(cols).fill(null));
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
            color: `hsl(${Math.random() * 40 + 25}, 70%, 58%)`,
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
                    } else {
                        // ✅ 기존보다 훨씬 좁게 퍼지게
                        const spread = [
                            [0, 0],
                            [-1, 0],
                            [1, 0],
                            [0, -1],
                        ];

                        for (const [sx, sy] of spread) {
                            const nx = gx + sx;
                            const ny = gy + sy;
                            if (isEmpty(nx, ny)) {
                                setSand(nx, ny, clump.color);
                                break;
                            }
                        }
                    }
                }
            }
        }
    };

    const handleCanvasClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        spawnClump(e.clientX - rect.left, e.clientY - rect.top);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const updateSand = (now) => {
            const grid = gridRef.current;
            const rows = rowsRef.current;
            const cols = colsRef.current;

            for (let y = rows - 2; y >= 0; y--) {
                for (let x = 0; x < cols; x++) {
                    const sand = grid[y][x];
                    if (!sand) continue;

                    const age = now - sand.settledAt;

                    // ✅ 3초 지나면 거의 멈춤
                    // 완전히 고정하면 너무 딱딱해 보일 수 있어서
                    // 아주 약간만 움직일 확률 남겨둠
                    if (age > 3000 && Math.random() > 0.01) continue;

                    // 아래로
                    if (isEmpty(x, y + 1)) {
                        grid[y + 1][x] = {
                            ...sand,
                            settledAt: now,
                        };
                        grid[y][x] = null;
                        continue;
                    }

                    // ✅ 좌하/우하 이동 확률을 줄여서 덜 퍼지게
                    const dirFirst = Math.random() < 0.5 ? -1 : 1;
                    const dirSecond = -dirFirst;

                    if (Math.random() < 0.35 && isEmpty(x + dirFirst, y + 1)) {
                        grid[y + 1][x + dirFirst] = {
                            ...sand,
                            settledAt: now,
                        };
                        grid[y][x] = null;
                        continue;
                    }

                    if (Math.random() < 0.2 && isEmpty(x + dirSecond, y + 1)) {
                        grid[y + 1][x + dirSecond] = {
                            ...sand,
                            settledAt: now,
                        };
                        grid[y][x] = null;
                        continue;
                    }

                    // ✅ 가로 퍼짐은 아주 드물게만
                    if (age < 1200 && Math.random() < 0.03) {
                        if (isEmpty(x + dirFirst, y)) {
                            grid[y][x + dirFirst] = {
                                ...sand,
                                settledAt: now,
                            };
                            grid[y][x] = null;
                            continue;
                        }

                        if (isEmpty(x + dirSecond, y)) {
                            grid[y][x + dirSecond] = {
                                ...sand,
                                settledAt: now,
                            };
                            grid[y][x] = null;
                        }
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
                if (clump.x + clump.radius > canvas.width) {
                    clump.x = canvas.width - clump.radius;
                    clump.vx *= -bounce;
                }

                if (clump.y + clump.radius >= canvas.height) {
                    clump.y = canvas.height - clump.radius;
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

        const drawSand = () => {
            const grid = gridRef.current;
            const rows = rowsRef.current;
            const cols = colsRef.current;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const sand = grid[y][x];
                    if (!sand) continue;

                    ctx.fillStyle = sand.color;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        };

        const drawClumps = () => {
            clumpsRef.current.forEach((clump) => {
                ctx.beginPath();
                ctx.arc(clump.x, clump.y, clump.radius, 0, Math.PI * 2);
                ctx.fillStyle = clump.color;
                ctx.fill();
                ctx.closePath();
            });
        };

        const update = (now) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            updateClumps();
            updateSand(now);

            drawSand();
            drawClumps();

            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    useEffect(() => {
        const resizeCanvas = () => {
            if (!canvasRef.current) return;

            const rect = canvasRef.current.parentElement.getBoundingClientRect();
            canvasRef.current.width = rect.width;
            canvasRef.current.height = rect.height;

            createGrid(rect.width, rect.height);
            clumpsRef.current = [];
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
                클릭하면 모래 덩어리가 떨어져요
            </div>
            <div className="absolute top-9 left-4 text-[11px] text-zinc-600 pointer-events-none">
                바닥이나 다른 모래에 닿으면 파사삭 부서져 쌓입니다
            </div>
        </div>
    );
}