import React, { useState, useCallback, useMemo } from "react";
import { Button } from "../buttons";
import { Input } from "../input";
import { useInput } from "../hooks/input";

const inputNames = ["name", "surname"] as const;

export const RegistrationForm: React.FC = props => {
    const inputs = {
        name: useInput(""),
        surname: useInput(""),
        mail: useInput(""),
        password: useInput(""),
        mobile: useInput(""),
    }

    const handleRegistration = useCallback(() => {
        const randKey = inputNames[Math.floor(Math.random() * inputNames.length)];
        inputs[randKey].focus();
        inputs[randKey].setError("sssss");
    }, []);

    const handleClearForm = useCallback(() => {
        Object.values(inputs).forEach(e => e.clear());
    }, []);

    return (
        <div>
            <Input placeholder="სახელი" {...inputs.name} />
            <Input placeholder="გვარი" {...inputs.surname} />
            <Input placeholder="მეილი" {...inputs.mail} />
            <Input placeholder="მობილური" {...inputs.mobile} />
            <Input placeholder="პაროლი" {...inputs.password} type="password" />
            <Button onClick={handleClearForm}>გასუფთავება</Button>
            <Button type="primary" onClick={handleRegistration}>რეგისტრაცია</Button>
        </div>
    );
}
