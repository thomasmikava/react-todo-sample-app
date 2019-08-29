

type UserKeys = keyof User;

export type PUser = Partial<User>;

type Partial2<T extends {}> = {
    [key in keyof T]?: T[key];
}
type PUser2 = Partial2<User>;

type CombineObjects<T1 extends {}, T2 extends {}> = {
    [key in keyof T1 | keyof T2]: key extends keyof T1
        ? key extends keyof T2 ? T1[key] | T2[key] : T1[key]
        : key extends keyof T2
            ? T2[key]
            : never;
}

type User<IdType extends string | number = number> = {
    id: IdType;
    name: string | undefined;
    surname?: string | undefined;
}
type A = CombineObjects<User, { name: number; age: number }>;


const c = "abc";

type UserWithNumberId = User;
type UserWithNumberId2 = User<typeof c>;

// type A = "aa" extends string ? number : false;

type User2<IdType> = {
    id: IdType extends string ? number[] : boolean;
    name: IdType extends string | number ? IdType : never;
}

type user2 = User2<"aaa">;

type AnyObjWithNumValues = {
    [a: string]: number;
}

type ReplaceNumberWithString<T extends {}> = {
    [key in keyof T]: T[key] extends number ? string : T[key];
}

type user4 = Pick<User, "name" | "id">;

type test = ReplaceNumberWithString<User>;

type B<T, K> = T extends K ? never : T;

type a1 = "a" | "b" | "c";
type a2 = "e" | "d" | "c";

type c = Exclude<a1, a2>;

type Pick2<T extends {}, K extends keyof T> = {
    [key in K]: T[key];
}
type user5 = Pick2<User, "name" | "id">;

type excdue2<T extends {}, K extends keyof T> = {
    [key in Exclude<keyof T, K>]: T[key];
}

type user6 = excdue2<User, "name">;

type Optionals<T extends {}, K extends keyof T> = {
    [key in K]?: T[key]
} & {
    [key in Exclude<keyof T, K>]: T[key];
};

type TestOptions = Optionals<User, "surname">;

type removeUnd<T extends {}, K extends keyof T> = {
    [key in K]-?: undefined extends T[key] ? Exclude<T[key], undefined> : T[key]
} & {
    [key in Exclude<keyof T, K>]: T[key]
};
export type some = removeUnd<User, "name">

