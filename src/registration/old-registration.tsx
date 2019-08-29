import React from "react";
import { Button } from "../buttons";
import { Input } from "../input";

const inputNames = ["name", "surname", "mail", "password"] as const;
type inputName = (typeof inputNames)[number];

type IState = {
    errors: {
        [key in inputName]?: string;
    };
} & {
    [key in inputName]: string;
}

function createObjectByArray<T extends string, K>(arr: readonly T[], value: () => K): { [key in T]: K };
function createObjectByArray<T extends string, K>(arr: readonly T[], value: K): { [key in T]: K };
function createObjectByArray<T extends string, K>(arr: readonly T[], value: K | (() => K)): { [key in T]: K } {
    const obj = {} as { [key in T]: K };
    for (const key of arr) {
        obj[key] = typeof value === "function" ? (value as (() => K))() : value;
    }
    return obj;
}

export class RegistrationForm extends React.Component<{}, IState> {

    references = createObjectByArray(inputNames, () => React.createRef<HTMLInputElement>());

    state: IState = {
        ...createObjectByArray(inputNames, ""),
        errors: {},
    }

    handleRegistration = () => {
        const arr = inputNames;
        const randKey = arr[Math.floor(Math.random() * arr.length)];
        // const randKey = "password";
        this.setState({
            errors: {
                [randKey]: "m",
            },
        });
        const ref = this.references[randKey];
        if (ref.current) {
            ref.current.focus();
        }
    }

    handleInputChange = (id: inputName) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            errors: {
                ...this.state.errors,
                [id]: undefined,
            },
            [id]: event.target.value,
        } as any);
    }

    handleClearForm = () => {
        this.setState(createObjectByArray(inputNames, ""))
    }

    render() {
        const { errors } = this.state;
        return (
            <div>
                <Input inputRef={this.references.name} placeholder="სახელი" onChange={this.handleInputChange("name")} hasErrors={!!errors.name} value={this.state.name} />
                <Input inputRef={this.references.surname} placeholder="გვარი" onChange={this.handleInputChange("surname")} hasErrors={!!errors.surname} value={this.state.surname}  />
                <Input inputRef={this.references.password} placeholder="პაროლი" type="password"  onChange={this.handleInputChange("password")} hasErrors={!!errors.password} value={this.state.password} />
                <Input inputRef={this.references.mail} placeholder="მეილი" onChange={this.handleInputChange("mail")} hasErrors={!!errors.mail} value={this.state.mail} />
                <Input inputRef={this.references.password} placeholder="პაროლი" type="password"  onChange={this.handleInputChange("password")} hasErrors={!!errors.password} value={this.state.password} />
                <Button onClick={this.handleClearForm}>გასუფთავება</Button>
                <Button type="primary" onClick={this.handleRegistration}>რეგისტრაცია</Button>
            </div>
        )
    }
}
