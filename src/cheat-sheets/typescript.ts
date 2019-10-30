// Custom Types
type str = string;

type stringArrayOrNumberArray = string[] | number[];

// We can use types to declare variables
const someStringVariable: str = "Can you see this line?";


// Type of Objects
type user = {
    id: number;
    firstname: string;
    lastname: string;
    mail: string | null;
    mail2: string | undefined;
    mobile?: string; // "?" means that property is not Required, i.e. can be undefined
};

//or

interface IUser {
    id: number;
    firstname: string;
    lastname: string;
    mail: string | null;
    mobile?: string; // almost same as mobile: string | undefined with subtle difference
}

type IAnyObject = {
    [key: string]: string;
}

// Adding types to variables
const funniestUserInTheWorld: IUser = {
    id: 7,
    firstname: "Jumber",
    lastname: "Tkabladze",
    mail: "gummy.bear@nuki.com",
}


// types can be exported and imported
export type stringOrNumber = string | number;


// All standard types are supported in typescript
type primitiveTypes = string | number | null | undefined | boolean;
type referenceTypes = {} | [] | string[] | { name: string };

// We can have specific values too as types
type userType = "teacher" | "student";

type ITeacher = {
    type: "teacher";
    id: number;
    studentIds: number[];
}

type IStudent = {
    type: "student";
    id: number;
    teacherId: number;
}

// Special types
type IAmEveryBodysType = any; // Union of every possible type

type IAmImpossibleToAchieve = never; // "never" type describes impossible types
let myUserType: userType = "student";
if (6 > 5) {
    myUserType = "teacher";
}

if (myUserType === "student") {
    const studentType = myUserType; // "student"
    console.log("In this if statement type of myUserType is 'student'");
} else if (myUserType === "teacher") {
    const teacherType = myUserType; // "teacher"
    console.log("In this if statement type of myUserType is 'teacher'");
} else {
    const neverType = myUserType; // never
    console.log("This else is impossible, so here type of myUserType is `never`");
}

// never does not take part in `or` union types
type stringOrNever = string | never; // same as string

// Tuples - fixed size arrays with known types on each index
type CartesianCoordinates = [number, number];


// Adding types to functions
function getMax(a: number, b: number): number {
    return a > b ? a : b;
}

const getMax2 = (a: number, b: number): number => a > b ? a : b;

// Tip: return type for small functions are not really necessary
const getMaxWithoutReturnType = (a: number, b: number) => a > b ? a : b;
const c = getMaxWithoutReturnType(8, 9);

/**
 * Tip: adding types to variables are not always necessary
 * Typescript will try to "guess" the type itself.
 * We can use typeof keyword to get variable's type
*/
const friends = ["Masha", "The Bear next to Masha"];
type IFriends = typeof friends;

const variableWithoutType = {
    someArrayProperty: [10, "hm", null, 7],
    friends,
    nestedObj: {
        name: "Why is this string, I have 3 names",
        motto: "Just because you know my name doesn't mean you know my story",
    },
    userType: "student" as "student" | "teacher",
    // without `as` keyword, type of userType would have been string
}
type SomeStrangeType = typeof variableWithoutType;

// We can extract property's type from object's type
type MottoType = SomeStrangeType["nestedObj"]["motto"]; // type MottoType = string


// TypeScript cannot guess type of empty array, so adding type is required
const strArray = ["a", "b"]; // typeof strArray = string[];

const hmArray = [];
// typeof hmArray = any[];
// However, in early versions of typescript, type would have been `never[]`;

// We can use enums to group simmilar values
enum UserType {
    student, // 0
    teacher // 1
};

enum UserType2 {
    student = "STA",
    teacher = "TCH"
};

type UserTypeStudent = UserType2.student;
// even though UserType2.student is "ST", the type of it is still UserType2.student
// const studentType: UserTypeStudent = "ST"; // ERROR: Type '"ST"' is not assignable to type 'UserType2.student'


// We can use generics to create types with same logic
type Arr<T> = T[];

type strArray = Arr<string>; // Here string will be passed as T, so result will be string[]
type strOrNumArray = Arr<string | number>; // (string | number)[]


// recursive generics
type Rec<T> = {
    name: T | Rec<T>;
}

const nestedName: Rec<string> = {
    name: {
        name: {
            name: {
                name: "blaa"
            },
        }
    }
}

// Generics with default values
type Arr2<T = number> = T[];
type numberArray = Arr2;
type numberArray2 = Arr2<number>;
type stringArray2 = Arr2<string>;

// Generics with boundings
interface UserWithIds<IdType extends string | number> {
    id: IdType;
    name: string;
}

type NumTypeUser = UserWithIds<number>;
type NumTypeUserIdType = NumTypeUser["id"]; // = number

type SpecialStringTypeUser = UserWithIds<"uniqueStr">;
type SpecialStringTypeUserIdType = SpecialStringTypeUser["id"]; // = "uniqueStr"


// Some built-in generics in TypeScript
//Array<T>
type numArray = Array<number>;

// Partial<T>
type partialUser = Partial<IUser>; // all keys will be non-required

// Omit<T, K>
type UserWithoutId = Omit<IUser, "id">;
type UserWithoutNames = Omit<IUser, "firstname" | "lastname">;

// Record<K, T>
type INames = Record<"name" | "surname", string>;

// ReturnType<T>
type FuncType = (arg: number) => number | string;
type FuncRetType = ReturnType<FuncType>; // number | string

const funcImplementation = (arg: number) => !arg ? "empty" : arg;
type funcImplementationRetunRtype = ReturnType<typeof funcImplementation>; // number | "empty"


// Special keywords

// in keyword
type names = "name" | "surname" | "nickname";
type IUserShortInfo = {
    [key in names]: string;
    // `id: number` is illegal here, however, we can use Union types to achieve it
}
/*
{
    name: string;
    surname: string;
    nickname: string;
}
*/
type IUserShortInfoWithId = IUserShortInfo & { id: number };
/*
{
    id: number;
    name: string;
    surname: string;
    nickname: string;
}
*/

// keyof keyword
type UserShortInfoWithIdKeys = keyof IUserShortInfoWithId;
// UserShortInfoWithIdKeys = "name" | "surname" | "nickname" | "id";

// Using in keywords to write Record generics ourselves
type Record2<K extends string, T> = {
    [key in K]: T;
}
type UserShortInfoWithRecord2 = Record2<"name" | "surname", string>;

// Using in and keyof keywords to write Parial generics ourselves
type Partial2<T extends {}> = {
    [key in keyof T]?: T[key];
}
type UserShortInfoWithPartial2 = Partial2<UserShortInfoWithRecord2>;

//Using general types as keys
type NameOrMailType = IUser["firstname" | "mail"] // = string | null

type ObjectWithNullValues = {
    [key: string]: null | null[];
}

type AllObjectValueTypes = ObjectWithNullValues[string] // = null[] | null

type UsersArr = IUser[];
type UsersArrSingleElement = UsersArr[number];


// !! Question: How is number working to extract the type of elements of array?

// We can use conditionals to create types
type A = "a";
type B = A extends string ? A : A[];

// We can use conditionals in generics too
type Diff<T, K> = T extends K ? never : T;
type c = Diff<"a" | "b" | "dd", "b" | "c">;

// Let's write Omit generics ourselves
// like this
type Omit2<T extends {}, K extends keyof T> = {
    [z in keyof T]: z extends K ? never : T[z];
}

////// STOPPED HERE!!!!

// or like this
type Omit3<T, K extends keyof T> = {
    [key in Diff<keyof T, K>]: T[key];
}
// !! Questions: How is Omit2 different from Omit3? And why is Omit3 better approach?

type UserWithoutIdGeneratedByOmit3 = Omit2<IUser, "id">;
type UserWithoutIdGeneratedByOmit2 = Omit3<IUser, "id">;

// infer keyword

// deconstruct array
type InstanceOfArray<T> = T extends (infer K)[] ? K : never;

type inst1 = InstanceOfArray<string[]>;
type inst2 = InstanceOfArray<(string | number)[]>;

// Writing ReturnType generics ourselves
type ReturnType2<T extends (...args: any[]) => any> =
    T extends (...args: any[]) => infer R ? R : never;

type funcRetType = ReturnType2<(a: string, b: string) => number>;

// Get type of arguments
type Arg1Type<T extends Function> =
    T extends (a1: infer R, ...args: any[]) => any ? R : never;
type FArg1 = Arg1Type<(a: number, b: string) => number>; // number

type ArgTypes<T extends Function> =
    T extends (...args: infer R) => any ? R : never;
    
type ArgNthType<F extends Function, N extends number> =
    ArgTypes<F>[N];

type Arg1<F extends Function> = ArgNthType<F, 0>;
type Arg2<F extends Function> = ArgNthType<F, 1>;
type Arg3<F extends Function> = ArgNthType<F, 2>;
type Arg4<F extends Function> = ArgNthType<F, 3>;


// - and + modifiers
type RequireAllKeys<T extends {}> = {
    [key in keyof T]-?: T[key]; // removes undefined from possibilities
}

type RequiredUser = RequireAllKeys<IUser>;

// Readonly generics

const constantNumberArray: ReadonlyArray<number> = [7, 8];
// constantNumberArray.push(8); Error

const baby: Readonly<IUser> = {
    id: 6,
    firstname: "can't touch this",
    lastname: "neither this",
    mail: "and neither this!",
}
// baby.firstname = "43"; error

// using readonly in generics

type RemoveReadonly<T> = {
    -readonly [key in keyof T]: T[key];
}

type NotReadonlyUser = RemoveReadonly<Readonly<IUser>>;

type MarkReadonlyKeys<T, K extends keyof T> = {
    readonly [key in K]: T[key];
} & {
    [key in Diff<keyof T, K>]: T[key];
}

type ReadonlyUserWithIdAndMail = MarkReadonlyKeys<IUser, "id" | "mail">;
const userWithConstantIdAndMail: ReadonlyUserWithIdAndMail = {
    id: 6, // cannot be changed
    firstname: "f", // can be changed
    lastname: "l", // can be changed
    mail: "a@b.com", // can be changed,
    mobile: "557557557"
}
userWithConstantIdAndMail.firstname = "6"; // OK
// userWithConstantIdAndMail.mail = "5"; Error
// userWithConstantIdAndMail.id = 6; Error


// Assignment
// Write generic GetKeysOfType<T extends {}, K> such that it will return the keys those corresponding values extend K
// For Instance, GetKeysOfType<{ name: "something": surname: string; age: number }, string> must be equal to "name" | "surname";


// ENCODED Solution. Hint: quite known (but weak) encoding algorithm is used to encode this 
// dHlwZSBHZXRLZXlzT2ZUeXBlPFQgZXh0ZW5kcyB7fSwgQj4gPSB7CiAgICBbIGsgaW4ga2V5b2YgVF0gOiBUW2tdIGV4dGVuZHMgQiA/IGsgOiBuZXZlcjsKfVtrZXlvZiBUXTs=