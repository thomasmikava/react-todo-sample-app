import { CitiesController } from "./api/cities/controller";
import { Requests } from "./api";
import { cityModelWrapper, cityCRUDActionTypes } from "./models/city";
import { store } from ".";

const Container = {
    CitiesController: new CitiesController(Requests),
    CityModel: cityModelWrapper(store, cityCRUDActionTypes),
}

export function inject<K extends keyof typeof Container>(key: K): (typeof Container)[K] {
    return Container[key];
}
