
type numOrStr = number | string;

function getMax(a: any, b: "student" | "teacher" | "admin") {
    return (+a) + (+b);
}

const g = getMax({}, "student"); // "79"

const getMax2 = (a: number, b: number) => {
    return a + b;
}

