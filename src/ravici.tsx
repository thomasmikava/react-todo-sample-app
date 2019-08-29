import React, { useState, useCallback, useMemo, useEffect } from "react";

const Counter: React.FC = () => {
    const [counter, setCounter] = useState(0);
    

    const func1 = () => {
        setCounter((counter) => counter + 1)
    };
    const handleIncrement = useCallback(func1, [counter]);

    const func2 = () => {
        setCounter((counter) => counter - 1)
    };
    const handleDecrement = useCallback(func2, []);
    const dimensions = useDimensions();
    return (
        <div>
            <div>{dimensions.width + " " + dimensions.height}</div>
            <div>
                <button onClick={handleIncrement}>+</button>
            </div>
            <div>{counter}</div>
            <div>
                <button onClick={handleDecrement}>-</button>
            </div>
        </div>
    );
}

const useDimensions = () => {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
        window.addEventListener("resize",handleResize);
        return () => window.removeEventListener("resize",handleResize);
    }, []);
    return dimensions;
}
export default Counter;