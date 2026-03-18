import { useEffect, useRef } from "react";

export default function TetrisDrop() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const WORLD_WIDTH = 960;
        const WORLD_HEIGHT = 600;

        const COLS = 20;
        const ROWS = 15;

        const rand = (min, max) => Math.random() * (max - min) + min;

        const viewport = {
            cssWidth: WORLD_WIDTH,
            cssHeight: WORLD_HEIGHT,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            dpr: 1,
        };

        const SHAPES = [
            [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
            [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // O
            [[0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // T
            [[0, 0, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // L
            [[1, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // J
            [[0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // S
            [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // Z
        ];

        const rotateCW = (m) => {
            const n = m.length;
            const r = Array.from({ length: n }, () => Array(n).fill(0));
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++) {
                    r[x][n - 1 - y] = m[y][x];
                }
            }
            return r;
        };

        const makeBoard = () =>
            Array.from({ length: ROWS }, () => Array(COLS).fill(null));

        const newColor = () => `rgba(228,228,231,${rand(0.5, 0.9)})`;

        const newPiece = () => {
            let s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            const times = Math.floor(Math.random() * 4);
            for (let i = 0; i < times; i++) s = rotateCW(s);

            return {
                shape: s,
                x: Math.floor(COLS / 2) - 2,
                y: -2,
                color: newColor(),
            };
        };

        const state = {
            w: WORLD_WIDTH,
            h: WORLD_HEIGHT,
            cellW: WORLD_WIDTH / COLS,
            cellH: WORLD_HEIGHT / ROWS,

            board: makeBoard(),
            active: null,
            next: newPiece(),

            score: 0,
            started: false,
            gameOver: false,

            dropMs: 520,
            acc: 0,
            last: 0,

            focused: false,
            endedMsgUntil: 0,
        };

        const collides = (shape, px, py) => {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (!shape[y][x]) continue;

                    const bx = px + x;
                    const by = py + y;

                    if (bx < 0 || bx >= COLS || by >= ROWS) return true;
                    if (by >= 0 && state.board[by][bx]) return true;
                }
            }
            return false;
        };

        const clearLines = () => {
            let cleared = 0;

            for (let y = ROWS - 1; y >= 0; y--) {
                if (state.board[y].every(Boolean)) {
                    state.board.splice(y, 1);
                    state.board.unshift(Array(COLS).fill(null));
                    cleared++;
                    y++;
                }
            }

            state.score += [0, 100, 300, 500, 800][cleared] || 0;
        };

        const spawn = () => {
            state.active = state.next || newPiece();
            state.active.x = Math.floor(COLS / 2) - 2;
            state.active.y = -2;
            state.next = newPiece();

            if (collides(state.active.shape, state.active.x, state.active.y)) {
                state.gameOver = true;
            }
        };

        const lock = () => {
            const { shape, x, y, color } = state.active;

            for (let sy = 0; sy < 4; sy++) {
                for (let sx = 0; sx < 4; sx++) {
                    if (!shape[sy][sx]) continue;

                    const bx = x + sx;
                    const by = y + sy;

                    if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
                        state.board[by][bx] = color;
                    }
                }
            }

            clearLines();
            spawn();
        };

        const resetGame = () => {
            state.board = makeBoard();
            state.score = 0;
            state.gameOver = false;
            state.acc = 0;
            state.next = newPiece();
            spawn();
        };

        const exitGame = (now) => {
            state.started = false;
            state.gameOver = false;
            state.active = null;
            state.acc = 0;
            state.endedMsgUntil = now + 2000;
        };

        const recalcViewport = () => {
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            viewport.cssWidth = rect.width;
            viewport.cssHeight = rect.height;
            viewport.dpr = dpr;

            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            viewport.scale = Math.min(
                rect.width / WORLD_WIDTH,
                rect.height / WORLD_HEIGHT
            );

            viewport.offsetX = (rect.width - WORLD_WIDTH * viewport.scale) / 2;
            viewport.offsetY = (rect.height - WORLD_HEIGHT * viewport.scale) / 2;
        };

        const beginWorldTransform = () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.setTransform(
                viewport.dpr * viewport.scale,
                0,
                0,
                viewport.dpr * viewport.scale,
                viewport.offsetX * viewport.dpr,
                viewport.offsetY * viewport.dpr
            );
        };

        const drawCell = (gx, gy, fill) => {
            const px = gx * state.cellW;
            const py = gy * state.cellH;

            ctx.fillStyle = fill;
            ctx.fillRect(px + 1, py + 1, state.cellW - 2, state.cellH - 2);

            ctx.strokeStyle = "rgba(228,228,231,0.12)";
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 2, py + 2, state.cellW - 4, state.cellH - 4);
        };

        const drawMiniPiece = (shape, x, y, size, color) => {
            for (let sy = 0; sy < 4; sy++) {
                for (let sx = 0; sx < 4; sx++) {
                    if (!shape[sy][sx]) continue;
                    ctx.fillStyle = color;
                    ctx.fillRect(x + sx * size, y + sy * size, size - 1, size - 1);
                }
            }
        };

        const getGhostY = () => {
            if (!state.active) return null;
            let ghostY = state.active.y;
            while (!collides(state.active.shape, state.active.x, ghostY + 1)) {
                ghostY += 1;
            }
            return ghostY;
        };

        const drawGhost = () => {
            if (!state.active || state.gameOver) return;

            const ghostY = getGhostY();
            if (ghostY == null) return;

            const { shape, x, color } = state.active;
            const ghostColor = color.replace(/[\d.]+\)$/, "0.18)");

            for (let sy = 0; sy < 4; sy++) {
                for (let sx = 0; sx < 4; sx++) {
                    if (!shape[sy][sx]) continue;

                    const bx = x + sx;
                    const by = ghostY + sy;

                    if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
                        drawCell(bx, by, ghostColor);
                    }
                }
            }
        };

        const draw = (now) => {
            beginWorldTransform();

            ctx.fillStyle = "rgba(9, 9, 11, 0.85)";
            ctx.fillRect(0, 0, state.w, state.h);

            ctx.strokeStyle = "rgba(228,228,231,0.06)";
            ctx.lineWidth = 1;

            for (let x = 1; x < COLS; x++) {
                const px = x * state.cellW;
                ctx.beginPath();
                ctx.moveTo(px, 0);
                ctx.lineTo(px, state.h);
                ctx.stroke();
            }

            for (let y = 1; y < ROWS; y++) {
                const py = y * state.cellH;
                ctx.beginPath();
                ctx.moveTo(0, py);
                ctx.lineTo(state.w, py);
                ctx.stroke();
            }

            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    const fill = state.board[y][x];
                    if (fill) drawCell(x, y, fill);
                }
            }

            drawGhost();

            if (state.active) {
                const { shape, x, y, color } = state.active;
                for (let sy = 0; sy < 4; sy++) {
                    for (let sx = 0; sx < 4; sx++) {
                        if (!shape[sy][sx]) continue;

                        const bx = x + sx;
                        const by = y + sy;

                        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
                            drawCell(bx, by, color);
                        }
                    }
                }
            }

            ctx.fillStyle = "rgba(228,228,231,0.95)";
            ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto";
            ctx.fillText(`Score: ${state.score}`, 12, 22);

            ctx.fillText("Next", state.w - 52, 22);
            if (state.next) {
                drawMiniPiece(state.next.shape, state.w - 54, 30, 10, state.next.color);
            }

            ctx.fillStyle = "rgba(228,228,231,0.55)";
            ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
            ctx.fillText(
                "← → 이동 | ↑ 회전 | ↓ 소프트드롭 | Space 하드드롭 | 클릭 시작/재시작 | ESC 종료",
                12,
                state.h - 10
            );

            if (!state.started) {
                ctx.fillStyle = "rgba(0,0,0,0.55)";
                ctx.fillRect(0, 0, state.w, state.h);

                ctx.fillStyle = "rgba(228,228,231,0.95)";
                ctx.font = "700 20px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText(
                    "게임 시작하기",
                    Math.floor(state.w / 2) - 62,
                    Math.floor(state.h / 2) - 6
                );

                ctx.fillStyle = "rgba(228,228,231,0.70)";
                ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText(
                    "캔버스를 클릭하세요",
                    Math.floor(state.w / 2) - 66,
                    Math.floor(state.h / 2) + 18
                );
            }

            if (state.gameOver) {
                ctx.fillStyle = "rgba(0,0,0,0.65)";
                ctx.fillRect(0, 0, state.w, state.h);

                ctx.fillStyle = "rgba(228,228,231,0.95)";
                ctx.font = "700 22px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText(
                    "GAME OVER",
                    Math.floor(state.w / 2) - 68,
                    Math.floor(state.h / 2) - 8
                );

                ctx.fillStyle = "rgba(228,228,231,0.75)";
                ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText(
                    "클릭해서 재시작",
                    Math.floor(state.w / 2) - 58,
                    Math.floor(state.h / 2) + 18
                );
            }

            if (now < state.endedMsgUntil) {
                ctx.save();
                ctx.fillStyle = "rgba(0,0,0,0.55)";
                ctx.fillRect(10, 32, 168, 28);

                ctx.fillStyle = "rgba(228,228,231,0.90)";
                ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText("게임을 종료했어요", 18, 51);
                ctx.restore();
            }
        };

        const move = (dx) => {
            if (!state.active || state.gameOver) return;
            const nx = state.active.x + dx;
            if (!collides(state.active.shape, nx, state.active.y)) {
                state.active.x = nx;
            }
        };

        const dropOne = () => {
            if (!state.active || state.gameOver) return;

            const ny = state.active.y + 1;
            if (!collides(state.active.shape, state.active.x, ny)) {
                state.active.y = ny;
            } else {
                lock();
            }
        };

        const hardDrop = () => {
            if (!state.active || state.gameOver) return;

            while (!collides(state.active.shape, state.active.x, state.active.y + 1)) {
                state.active.y += 1;
            }
            lock();
        };

        const rotate = () => {
            if (!state.active || state.gameOver) return;

            const r = rotateCW(state.active.shape);

            if (!collides(r, state.active.x, state.active.y)) {
                state.active.shape = r;
                return;
            }
            if (!collides(r, state.active.x - 1, state.active.y)) {
                state.active.x -= 1;
                state.active.shape = r;
                return;
            }
            if (!collides(r, state.active.x + 1, state.active.y)) {
                state.active.x += 1;
                state.active.shape = r;
            }
        };

        const step = (now) => {
            const dt = now - state.last;
            state.last = now;

            if (state.started && !state.gameOver && state.active) {
                state.acc += dt;
                if (state.acc >= state.dropMs) {
                    state.acc = 0;
                    dropOne();
                }
            }

            draw(now);
            rafRef.current = requestAnimationFrame(step);
        };

        const onPointerDown = () => {
            state.focused = true;

            if (!state.started) {
                state.started = true;
                resetGame();
                return;
            }

            if (state.gameOver) {
                resetGame();
            }
        };

        const onWindowPointerDown = (e) => {
            if (e.target !== canvas) {
                state.focused = false;
            }
        };

        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                exitGame(performance.now());
                return;
            }

            if (!state.focused) return;
            if (!state.started || state.gameOver) return;

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                move(-1);
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                move(1);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                dropOne();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                rotate();
            } else if (e.code === "Space") {
                e.preventDefault();
                hardDrop();
            }
        };

        recalcViewport();

        const resizeObserver = new ResizeObserver(() => {
            recalcViewport();
        });

        if (container) {
            resizeObserver.observe(container);
        }

        state.last = performance.now();
        rafRef.current = requestAnimationFrame(step);

        canvas.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointerdown", onWindowPointerDown);
        window.addEventListener("keydown", onKeyDown, { passive: false });
        window.addEventListener("resize", recalcViewport);
        canvas.style.touchAction = "none";

        return () => {
            cancelAnimationFrame(rafRef.current);
            resizeObserver.disconnect();
            canvas.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerdown", onWindowPointerDown);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", recalcViewport);
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}