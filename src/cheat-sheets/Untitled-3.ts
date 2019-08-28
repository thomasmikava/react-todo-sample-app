export interface IUser {
    id: number;
    name: string;
    surname?: "fghb";
    age?: number;
}

type Blaa<T extends {}, B extends keyof T> = {
    [key in B]: T[key];
}

type dsd = Blaa<IUser, "id" | "name">;

type Omit2<T extends {} , K extends keyof T> = {
    [key in Exclude<keyof T, K>]: T[key]
}

type MakeSomeNull <T extends {}, B extends keyof T> = {
    [key in B]?: T[key];
}

type MakeSomeOptional <T extends {}, B extends keyof T> = 
{
    [key in B]?: T[key];
} & {
    [key in Exclude<keyof T, B>]: T[key]
}


type MakeSomeRequired<T extends {}, B extends keyof T> = 
{
    [key in B]-?: T[key];
} & {
    [key in Exclude<keyof T, B>]: T[key]
}


type smth = MakeSomeRequired<IUser, "surname">

// const a: smth = {};

const c: IUser = {
    id: 5,
    name: "eerre",
    age: 6,
}

type MakePartial<T extends {}> ={
    [k in keyof T]?: T[k]
}

type MakeRequired<T extends {}> ={
    [k in keyof T]-?: T[k]
}

type StringifyAllElements<T extends {}, B> = {
    [k in keyof T]?: B;
};

type UserWithStringValues = StringifyAllElements<IUser,  number>;

type MakeAllKeysNullsAsWell<T> = {
    [k in keyof T]: T[k] | null
}

type sdfds = MakeAllKeysNullsAsWell<IUser>;

type MarkStringValuesAsNull<T> = {
    [k in keyof T]: T[k] extends string  ? T[k] | null : T[k]
}

type a = MarkStringValuesAsNull<IUser>

type NthArgument<F extends Function, N extends number> =
    F extends (...args: infer E) => any ? E[N] : never;

type FuncType = (a: number, b: string) => any;
type ArgT = NthArgument<FuncType, 1>;

interface User {
    name: string;
    readonly id: number;
}