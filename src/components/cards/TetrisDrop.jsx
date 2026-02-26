import { useEffect, useRef } from "react";

export default function TetrisDrop() {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rand = (min, max) => Math.random() * (max - min) + min;

        const COLS = 20;
        const ROWS = 15;

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
            for (let y = 0; y < n; y++)
                for (let x = 0; x < n; x++)
                    r[x][n - 1 - y] = m[y][x];
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
            w: 0,
            h: 0,
            cellW: 20,
            cellH: 20,

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

            // ESC 종료 알림(토스트)
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

        // ESC로 “게임 종료(시작 화면으로 돌아가기)”
        const exitGame = (now) => {
            state.started = false;
            state.gameOver = false;
            state.active = null; // 떨어지는 도형 제거
            state.acc = 0;       // 타이밍 리셋
            state.endedMsgUntil = now + 2000; // 2초 토스트
        };

        // 캔버스 100% 꽉 차게
        const resize = () => {
            state.w = canvas.offsetWidth;
            state.h = canvas.offsetHeight;

            canvas.width = Math.floor(state.w * dpr);
            canvas.height = Math.floor(state.h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            state.cellW = state.w / COLS;
            state.cellH = state.h / ROWS;
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

        const draw = (now) => {
            ctx.clearRect(0, 0, state.w, state.h);

            // bg
            ctx.fillStyle = "rgba(9, 9, 11, 0.85)";
            ctx.fillRect(0, 0, state.w, state.h);

            // grid
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

            // locked
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    const fill = state.board[y][x];
                    if (fill) drawCell(x, y, fill);
                }
            }

            // active
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

            // HUD
            ctx.fillStyle = "rgba(228,228,231,0.95)";
            ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto";
            ctx.fillText(`Score: ${state.score}`, 12, 22);

            ctx.fillText("Next", state.w - 52, 22);
            if (state.next) {
                drawMiniPiece(state.next.shape, state.w - 54, 30, 10, state.next.color);
            }

            // 설명 문구 업데이트: ESC 추가
            ctx.fillStyle = "rgba(228,228,231,0.55)";
            ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
            ctx.fillText(
                "← → 이동 | ↓ 빠르게 | Space 회전 | 클릭: 시작/재시작 | ESC: 종료",
                12,
                state.h - 10
            );

            // start overlay
            if (!state.started) {
                ctx.fillStyle = "rgba(0,0,0,0.55)";
                ctx.fillRect(0, 0, state.w, state.h);

                ctx.fillStyle = "rgba(228,228,231,0.95)";
                ctx.font = "700 20px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText("게임 시작하기", Math.floor(state.w / 2) - 62, Math.floor(state.h / 2) - 6);

                ctx.fillStyle = "rgba(228,228,231,0.70)";
                ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText("캔버스를 클릭하세요", Math.floor(state.w / 2) - 66, Math.floor(state.h / 2) + 18);
            }

            // game over overlay
            if (state.gameOver) {
                ctx.fillStyle = "rgba(0,0,0,0.65)";
                ctx.fillRect(0, 0, state.w, state.h);

                ctx.fillStyle = "rgba(228,228,231,0.95)";
                ctx.font = "700 22px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText("GAME OVER", Math.floor(state.w / 2) - 68, Math.floor(state.h / 2) - 8);

                ctx.fillStyle = "rgba(228,228,231,0.75)";
                ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
                ctx.fillText("클릭해서 재시작", Math.floor(state.w / 2) - 58, Math.floor(state.h / 2) + 18);
            }

            // ESC 종료 토스트
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
            if (!collides(state.active.shape, nx, state.active.y)) state.active.x = nx;
        };

        const dropOne = () => {
            if (!state.active || state.gameOver) return;
            const ny = state.active.y + 1;
            if (!collides(state.active.shape, state.active.x, ny)) state.active.y = ny;
            else lock();
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

        const onKeyDown = (e) => {
            // ESC는 focused 없어도 먹게(진짜 “나가기” 느낌)
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
            } else if (e.code === "Space") {
                e.preventDefault();
                rotate();
            }
        };

        resize();
        state.last = performance.now();
        rafRef.current = requestAnimationFrame(step);

        canvas.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("keydown", onKeyDown, { passive: false });
        window.addEventListener("resize", resize);
        canvas.style.touchAction = "none";

        return () => {
            cancelAnimationFrame(rafRef.current);
            canvas.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full" />;
}