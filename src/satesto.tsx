import React, { useCallback, useState } from "react";

let lastFunction: any;

const getCallBack = () => {
    console.log("cb created");
    lastFunction = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log(e.pageX);
    };
    return lastFunction;
}

export const Sth = () => {
    console.log("started");
    const [counter, setCounter] = useState(0);
    const handleClick = useCallback(getCallBack(), []);
    console.log(lastFunction === handleClick);
    console.log("rendering");
    return (
        <div onClick={handleClick}>
            asddsa
            <div onClick={() => setCounter(c => c + 1)}>{counter}</div>
        </div>
    );
}