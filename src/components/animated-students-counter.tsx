"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedStudentsCounterProps = {
    className?: string;
    start?: number;
    step?: number;
    intervalMs?: number;
    prefixIcon?: string;
    label?: string;
    maxIncrements?: number;
};

export function AnimatedStudentsCounter({
    className,
    start = 32,
    step = 1,
    intervalMs = 2000,
    prefixIcon = "🎓",
    label = "סטונדטים שכבשו את ראיון העבודה שלהם בהצלחה",
    maxIncrements = 1,
}: AnimatedStudentsCounterProps) {
    const [count, setCount] = useState<number>(start);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const incrementsDoneRef = useRef<number>(0);

    useEffect(() => {
        incrementsDoneRef.current = 0;
        timerRef.current = setInterval(() => {
            incrementsDoneRef.current += 1;
            setCount((prev) => prev + step);
            if (incrementsDoneRef.current >= maxIncrements) {
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }, intervalMs);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [intervalMs, step, maxIncrements]);

    return (
        <div className={className ?? " text-amber-300 font-medium text-sm flex items-center gap-1 animate-pulse"}>
            <span>{prefixIcon}</span>
            <span>{count}+ {label}</span>
        </div>
    );
}


