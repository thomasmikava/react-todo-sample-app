import Joi, { SchemaToType } from "../../utils/joi";
import { CitySchema } from "./helper-schemas";


export const RGETCitiesSchema = Joi.array().items(CitySchema);
export type IRGETCities = SchemaToType<typeof RGETCitiesSchema>;

///

export const AGETCitySchema = Joi.object({
    cityId: Joi.number().required(),
});
export type IAGETCity = SchemaToType<typeof AGETCitySchema>;
export const RGETCitySchema = CitySchema;
export type IRGETCity = SchemaToType<typeof RGETCitySchema>;

///

export const APUTCitySchema = Joi.object({
    cityId: Joi.number().required(),
    name: Joi.string().required(),
    isInGeorgia: Joi.boolean().required(),
    isOnEarth: Joi.boolean().required(),
});
export type IAPUTCity = SchemaToType<typeof APUTCitySchema>;
export const RPUTCitySchema = CitySchema;
export type IRPUTCity = SchemaToType<typeof RPUTCitySchema>;

///
