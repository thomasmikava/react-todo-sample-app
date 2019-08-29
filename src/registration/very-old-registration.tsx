import React from "react";
import { Button } from "../buttons";

interface IState {
    errors?: {
        name?: string;
        surname?: string;
        mail?: string;
        password?: string;
    }
}

export class RegistrationForm extends React.Component<{}, IState> {

    state: IState = {

    }

    handleRegistration = () => {
        const arr = ["name", "surname", "mail", "password"] as const;
        arr.forEach(id => document.getElementById(id)!.style.border = "");
        const randKey = arr[Math.floor(Math.random() * arr.length)];
        const inputElement = document.getElementById(randKey)!;
        inputElement.focus();
        inputElement.style.border = "1px solid red";
    }

    handleInputChange = (id: string) => (event: any) => {
        const inputElement = document.getElementById(id)!;
        inputElement.style.border = "";
    }

    render() {
        return (
            <div>
                <input placeholder="სახელი" id="name" onChange={this.handleInputChange("name")} /><br />
                <input placeholder="გვარი" id="surname" onChange={this.handleInputChange("surname")}  /><br />
                <input placeholder="მეილი" id="mail" onChange={this.handleInputChange("mail")}  /><br />
                <input placeholder="პაროლი" id="password" type="password"  onChange={this.handleInputChange("password")} /><br />
                <Button type="primary" onClick={this.handleRegistration}>რეგისტრაცია</Button>
            </div>
        )
    }
}