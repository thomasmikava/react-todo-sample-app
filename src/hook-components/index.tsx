import React, { useState, useCallback, useEffect } from "react";

interface IState {
    width: number;
    height: number;
}

export class Staesto2 extends React.Component<{}, IState> {

    state: IState = {
        width: window.innerWidth,
        height: window.innerHeight,
    }

    handleResize = () => {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
        })
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    render() {
        return (
            <div>
                window width: {this.state.width};<br/>
                window height: {this.state.height};<br/>
            </div>
        )
    }
}

const useWindowDimensions = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, []);
    return { width, height };
}

export const useCounter = (defaultValue?: number) => {
    const [counter, setCount] = useState(defaultValue || 0);
    
    const handleDecrement = useCallback(() => {
        setCount(c => c - 1);
    }, []);

    const handleIncrement = useCallback(() => {
        setCount(c => c + 1)
    }, []);

    return {
        counter,
        handleDecrement,
        handleIncrement,
    }
}

const useInput = (defaultValue: string = "") => {
    const [value, setValue] = useState("");
    const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, []);

    return {
        value,
        onChange: handleValueChange,
    }
}

export const SatestoComponent: React.FC = props => {
    const { counter, handleDecrement, handleIncrement } = useCounter();
    const { width, height } = useWindowDimensions();
    const nameInput = useInput();
    const surnameInput = useInput();

    return (
        <div>
            <button onClick={handleDecrement}>-</button>
            counter: {counter}
            <button onClick={handleIncrement}>+</button>
            <input {...nameInput} />
            <input {...surnameInput} />
            <div>
                window width: {width};<br/>
                window height: {height};<br/>
            </div>
        </div>
    );
}
