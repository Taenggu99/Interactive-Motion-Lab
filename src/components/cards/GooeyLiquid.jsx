// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";

export default function GooeyLiquid() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const circles = [
        { id: 1, x: "30%", y: "40%", size: 60 },
        { id: 2, x: "70%", y: "60%", size: 80 },
        { id: 3, x: "50%", y: "50%", size: 100 },
        { id: 4, x: "20%", y: "70%", size: 50 },
        { id: 5, x: "80%", y: "30%", size: 70 },
    ];

    return (
        <div
            id="gooey-container"
            className="relative w-full h-full overflow-hidden bg-zinc-900 cursor-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
        >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                            result="goo"
                        />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>

                <g filter="url(#goo)">
                    {circles.map((circle) => (
                        <motion.circle
                            key={circle.id}
                            cx={circle.x}
                            cy={circle.y}
                            r={circle.size / 2}
                            fill="#3b82f6"
                            animate={{
                                x: isHovering ? (mousePos.x - 150) * 0.1 : 0,
                                y: isHovering ? (mousePos.y - 150) * 0.1 : 0,
                            }}
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        />
                    ))}
                    {isHovering && (
                        <motion.circle
                            cx={mousePos.x}
                            cy={mousePos.y}
                            r={40}
                            fill="#60a5fa"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
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
