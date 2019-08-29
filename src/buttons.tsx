import React, { useMemo } from "react";
import ButtonStyles from "./styles/buttons.module.css";
import classnames from "classnames";
import { ReactComponent as Loading } from "./styles/loading.svg";
import { ReactComponent as Loading2 } from "./styles/loading2.svg";

interface ButtonProps {
    onClick?: () => void;
    className?: string;
    type?: "default" | "primary" | "alert";
    isDisabled?: boolean;
    isLoading?: boolean;
    loadingComponent?: JSX.Element;
}

export const Button: React.FC<ButtonProps> = React.memo(props => {
    return (
        <div className={classnames(
            ButtonStyles.button, ButtonStyles[props.type || "default"], props.className,
            props.isDisabled && ButtonStyles.disabled
            )}
            onClick={props.onClick}
        >
            <span>{props.children}</span>
            {props.isLoading && <span>{props.loadingComponent || <Loading />}</span>}
        </div>
    );
});

export const ButtonsPage: React.FC<{}> = props => {
    return (
        <div>
            <Button type="primary" isLoading={true}>
                loading
            </Button>
            <Button type="alert" isLoading={true} loadingComponent={<Loading2 />}>bbb</Button>
        </div>
    )
}