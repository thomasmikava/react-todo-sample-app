import React, { useState } from "react";
import { RegistrationForm } from "./registration/registration-form";
import { ThemeContext } from ".";

export const RegistrationsPage = () => {
    const [generalCSSProperties, setGeneralCSSProperties] = useState<React.CSSProperties>({ fontSize: 20, color: "blue" });
    const [teacherCSSProperties, setTeacherCSSProperties] = useState<React.CSSProperties>({ fontSize: 20, color: "blue" });
    return (
        <div>
            <ThemeContext.Provider value={[generalCSSProperties, setGeneralCSSProperties]}>
                <RegistrationForm />
                <ThemeContext.Provider value={[teacherCSSProperties, setTeacherCSSProperties]}>
                    <RegistrationForm />
                </ThemeContext.Provider>
            </ThemeContext.Provider>
        </div>
    );
}