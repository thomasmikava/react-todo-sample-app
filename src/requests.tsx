import React, { useEffect } from "react";
import axios from "axios";

export const Requests = (props: any) => {

    useEffect(() => {
    }, []);
    
    return (
        <div>
            aaaaa
        </div>
    );
}

const racePromises = <T extends any>(promises: Promise<T>[]): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        let calledPromise = false;
        for (const pormise of promises) {
            pormise.then((data) => {
                if (calledPromise) return;
                calledPromise = true;
                resolve(data);
            }).catch((error) => {
                if (calledPromise) return;
                calledPromise = true;
                reject(error);
            });
        }
    });
}

const PromisesAll = <T extends any>(promises: Promise<T>[]): Promise<T[]> => {
    return new Promise<T[]>((resolve, reject) => {
        const resDatas: T[] = [];
        let rejected = false;
        let counter = 0;
        for (let index = 0; index < promises.length; index++) {
            promises[index].then(d => {
                counter++;
                resDatas[index] = d;
                if (counter === promises.length  && !rejected){
                    resolve(resDatas)
                }
            })
            .catch(e => {
                if(!rejected){
                    rejected = true;
                    reject(e)
                }
            })
        }


       
    });
}

const p1 = Promise.resolve(10);
const p2 = Promise.resolve("aa");

PromisesAll([p1, p2] as Promise<string | number>[]).then((data) => {
    const v1 = data;
});
