// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState, useId } from "react";

export default function GooeyLiquid() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const filterId = useId();

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const circles = [
        { id: 1, x: "30%", y: "40%", size: 60, speed: 0.04, wobble: 6 },
        { id: 2, x: "70%", y: "60%", size: 80, speed: 0.05, wobble: 8 },
        { id: 3, x: "50%", y: "50%", size: 100, speed: 0.03, wobble: 10 },
        { id: 4, x: "20%", y: "70%", size: 50, speed: 0.06, wobble: 7 },
        { id: 5, x: "80%", y: "30%", size: 70, speed: 0.045, wobble: 9 },
    ];

    return (
        <div
            id={`gooey-container-${filterId}`}
            className="relative w-full h-full overflow-hidden bg-zinc-900 cursor-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
        >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <filter id={`goo-${filterId}`}>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  
                                    0 1 0 0 0  
                                    0 0 1 0 0  
                                    0 0 0 25 -10"
                            result="goo"
                        />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>

                <g filter={`url(#goo-${filterId})`}>
                    {circles.map((circle) => (
                        <motion.circle
                            key={circle.id}
                            cx={circle.x}
                            cy={circle.y}
                            r={circle.size / 2}
                            fill="#3b82f6"
                            animate={{
                                x: isHovering
                                    ? (mousePos.x - 150) * circle.speed
                                    : 0,
                                y: isHovering
                                    ? (mousePos.y - 150) * circle.speed
                                    : 0,

                                // 출렁임
                                scale: [1, 1.08, 0.94, 1],

                                // 좌우 미세 움직임
                                rotate: [-2, 2, -1, 0],
                            }}
                            transition={{
                                duration: 2 + circle.id * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}

                    {isHovering && (
                        <motion.circle
                            cx={mousePos.x}
                            cy={mousePos.y}
                            r={45}
                            fill="#60a5fa"
                            initial={{ scale: 0 }}
                            animate={{
                                scale: [1, 1.2, 0.9, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    )}
                </g>
            </svg>

            <div className="absolute bottom-4 left-4 text-xs text-zinc-500 pointer-events-none">
                마우스를 움직여보세요
            </div>
        </div>
    );
}