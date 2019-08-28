import React, { useState, useRef, useCallback, useEffect } from "react";

interface ICounterRef {
    inc: () => void;
    dec: () => void;
}

export const SomeThing: React.FC<{}> = props => {
    const ref = useRef<ICounterRef>(null);

    const onDecrement  = useCallback(() => {
        if (!ref.current) return;
        ref.current.dec();
    }, []);
    const onIncrement  = useCallback(() => {
        if (!ref.current) return;
        ref.current.inc();
    }, []);

    return (
        <div>
            <Counter someRef={ref} />
            <button onClick={onDecrement}>Decrement Manually</button>
            <button onClick={onIncrement}>Increment Manually</button>
        </div>
    );
}

const Counter: React.FC<{ someRef: {current: ICounterRef | null} }> = (props) => {
    const [counter, setCounter] = useState(0);

    const onDecrement = useCallback(() => {
        setCounter(c => c - 1);
    }, []);
    const onIncrement = useCallback(() => {
        setCounter(c => c + 1);
    }, []);

    useEffect(() => {
        props.someRef.current = {
            dec: onDecrement,
            inc: onIncrement,
        };
    }, []);

    return (
        <div>
            <button onClick={onDecrement}>-</button>
            {counter}
            <button onClick={onIncrement}>+</button>
        </div>
    );
}
