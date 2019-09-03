import Joi, { SchemaToType } from "../../utils/joi";
import { CitySchema } from "./helper-schemas";

export const RGETCitiesSchema = Joi.array().items(CitySchema);
export type IRGETCities = SchemaToType<typeof RGETCitiesSchema>;

///

export const AGETCitySchema = Joi.object({
	cityId: Joi.objectId().required(),
});
export type IAGETCity = SchemaToType<typeof AGETCitySchema>;
export const RGETCitySchema = CitySchema;
export type IRGETCity = SchemaToType<typeof RGETCitySchema>;

///

export const APUTCitySchema = Joi.object({
	cityId: Joi.objectId().required(),
	name: Joi.string().required(),
});
export type IAPUTCity = SchemaToType<typeof APUTCitySchema>;
export const RPUTCitySchema = CitySchema;
export type IRPUTCity = SchemaToType<typeof RPUTCitySchema>;

///

export const APOSTCitySchema = Joi.object({
	name: Joi.string().required(),
});
export type IAPOSTCity = SchemaToType<typeof APOSTCitySchema>;
export const RPOSTCitySchema = CitySchema;
export type IRPOSTCity = SchemaToType<typeof RPOSTCitySchema>;

///

export const ADELETECitySchema = Joi.object({
	cityId: Joi.objectId().required(),
});
export type IADELETECity = SchemaToType<typeof ADELETECitySchema>;
