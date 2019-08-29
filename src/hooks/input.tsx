import React, { useState, useCallback } from "react";

export const useInput = (defaultValue: string = "") => {
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(input => ({
            ...input,
            value,
            error: "",
            hasErrors: false,
        }))
    }, []);
    const focus = useCallback(() => {
        if (input.inputRef.current) {
            input.inputRef.current.focus();
        }
    }, []);
    const setError = useCallback((error: string) => {
        setInput(input => ({
            ...input,
            error,
            hasErrors: !!error,
        }));
    }, []);
    const clear = useCallback(() => {
        setInput(input => ({
            ...input,
            value: "",
            error: "",
            hasErrors: false,
        }));
    }, []);
    const [input, setInput] = useState({
        value: defaultValue,
        inputRef: React.createRef<HTMLInputElement>(),
        onChange,
        error: "",
        focus,
        clear,
        hasErrors: false,
        setError,
    });
    return input;
}