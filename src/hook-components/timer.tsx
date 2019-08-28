import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useCounter } from ".";

const useDynamicRef = <T extends any>(value: T): { current: T } => {
    const valueRef = useRef(value);
    valueRef.current = value;
    return valueRef;
}

const getMax = (a: number, b: number) => {
    return Math.max(a, b);
}

export const Timer: React.FC = props => {
    const { counter, handleIncrement, handleDecrement } = useCounter(0);
    const [timeInMS, setTimeInMS] = useState(500);

    const maxOfCounterAndTime = useMemo(() => {
        return getMax(counter, timeInMS);
    }, [counter, timeInMS]);

    const logCount = () => {
        console.log(counter);
    }
    const logCountRef = useDynamicRef(logCount);

    useEffect(() => {
        const planned = setInterval(() => {
            logCountRef.current();
            handleIncrement();
        }, timeInMS);
        return () => {
            clearInterval(planned);
        }
    }, [timeInMS]);

    const handleTimerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTimeInMS(+e.target.value);
    }, []);
    const handleTimerChange2 = useMemo(() => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setTimeInMS(+e.target.value);
        }
    }, []);

    return (
        <div>
            <input type="number" defaultValue={timeInMS + ""} onChange={handleTimerChange} />
            {counter}
        </div>
    )
}