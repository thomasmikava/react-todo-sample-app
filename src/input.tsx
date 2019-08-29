import React from "react";
import styles from "./styles/input.module.css";
import classnames from "classnames";

interface InputProps {
    placeholder?: string;
    type?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    hasErrors?: boolean;
    value?: string;
    defaultValue?: string;
    icon?: JSX.Element;
    inputRef?: React.RefObject<HTMLInputElement>
}

export const Input: React.FC<InputProps> = props => {
    return (
        <div
            className={classnames({
                [styles.errorInput]: props.hasErrors,
                [styles.inputContainer]: true,
            })}
        >
            <input
                ref={props.inputRef}
                value={props.value}
                defaultValue={props.defaultValue}
                placeholder={props.placeholder}
                type={props.type}
                onChange={props.onChange}
            />
            {props.icon}
        </div>
    )
}