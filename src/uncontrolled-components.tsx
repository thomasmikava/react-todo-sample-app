import React, { useState, useCallback } from "react";

interface IState {
    names: string[];
}

const Form :React.FC = props => {
    const [names, setNames] = useState(["a", "b", "c"]);

    const handleAddingNewName = useCallback(() => {
        setNames(names => [...names, ""]);
    }, []);

    const handleNameDelete = useCallback((index: number) => {
        setNames(names => names.filter((e, i) => i !== index));
    }, []);

    const handleNameChange = useCallback((index: number, newName: string) => {
        setNames(names => names.map((e, i) => i !== index ? e : newName));
    }, []);

    return (
        <div>
            {names.map((name, i) => {
                return (
                    <Input
                        key={i}
                        defaultValue={name}
                        onDelete={() => handleNameDelete(i)}
                        onChange={(e) => handleNameChange(i, e.target.value)}
                    />
                );
            })}
            <button onClick={handleAddingNewName}>Add new Name</button>
        </div>
    );
}

const Input: React.FC<{
    defaultValue: string;
    onDelete: () => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = props => {
    return (
        <div>
            <input defaultValue={props.defaultValue} onChange={props.onChange} />
            <button onClick={props.onDelete}>delete</button>
        </div>
    )
}
