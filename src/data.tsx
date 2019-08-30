import React, { useReducer, useEffect, useState } from "react";
import { getCityByid, City } from "./req";

function counterReducer(state: number, action: "INC" | "DEC") {
    if (action === "DEC") return state - 1;
    if (action === "INC") return state + 1;
    throw new Error("incorrect action");
}

type FetchableData<T, ErrorType> = {
    data: T;
    isLoading: false;
    hasErrors: false;
} | {
    isLoading: true;
} | {
    isLoading: false;
    hasErrors: true;
    error: ErrorType;
}

type FecthAction<ResourceType, ErrorType> = {
    type: "startLoading";
} | {
    type: "hasFoundErrors";
    error: ErrorType;
} | {
    type: "successfulFetching";
    data: ResourceType;
}

function fetchReducer<ResourceType, ErrorType>(state: FetchableData<ResourceType, ErrorType>, action: FecthAction<ResourceType, ErrorType>): FetchableData<ResourceType, ErrorType> {
    if (action.type === "startLoading") {
        return {
            isLoading: true
        };
    }
    if (action.type === "hasFoundErrors") {
        return {
            isLoading: false,
            hasErrors: true,
            error: action.error,
        };
    }
    if (action.type === "successfulFetching") {
        return {
            data: action.data,
            hasErrors: false,
            isLoading: false,
        }
    }
    throw new Error("incorrect action");
}

export const MyCity: React.FC<{ cityId: number }> = (props) => {
    const cityId = props.cityId;
    const [city, cityDispatch] = useReducer(fetchReducer, {
        isLoading: true,
    } as FetchableData<City, any>);
    useEffect(() => {
        cityDispatch({
            type: "startLoading"
        });
        getCityByid(cityId).then((city) => {
            cityDispatch({
                type: "successfulFetching",
                data: city,
            });
        }).catch((e) => {
            cityDispatch({
                type: "hasFoundErrors",
                error: e,
            });
        });
    }, [cityId]);
    return (
        <div>
            {city.isLoading ? "loading..." : (
                city.hasErrors ? "has found errors" : "aaa"
            )}
        </div>
    );
}
