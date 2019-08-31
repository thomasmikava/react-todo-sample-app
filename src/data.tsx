import React, { useReducer, useEffect, useState } from "react";
import { getCityById, City } from "./req";
import { CitiesController } from "./api/cities/controller";
import { Requests } from "./api";
import { inject } from "./modules";

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

const useCity = (cityId: number | null) => {
    const [city, cityDispatch] = useReducer(fetchReducer, {
        isLoading: true,
    } as FetchableData<City, any>);
    useEffect(() => {
        const CitiesController = inject("CitiesController");
        cityDispatch({
            type: "startLoading"
        });
        if (!cityId) return;
        CitiesController.getById({ cityId });
    }, [cityId]);

    useEffect(() => {
        if (!cityId) return;
        const CityModel = inject("CityModel");
        return CityModel.subscribeChangeById(cityId, false, (city) => {
            if (city) {
                cityDispatch({
                    type: "successfulFetching",
                    data: city,
                });
            } else {
                cityDispatch({
                    type: "hasFoundErrors",
                    error: null,
                });
            }
        });
    }, [cityId]);
    return city;
}

export const MyCity: React.FC<{ cityId: number }> = (props) => {
    const cityId = props.cityId;
    const city = useCity(cityId);
    return (
        <div>
            {city.isLoading ? "loading..." : (
                city.hasErrors ? "has found errors" : "aaa"
            )}
        </div>
    );
}
