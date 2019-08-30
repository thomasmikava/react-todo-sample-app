export type City = {
    id: number;
    name: string;
}

export const getCityByid = (id: number): Promise<City> => {
    return new Promise<City>((resolve) => {
        setTimeout(() => {
            resolve({ id, name: "თბილისი" });
        }, Math.random() * 2000 + 100);
    });
}