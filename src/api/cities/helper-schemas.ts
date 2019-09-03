import Joi, { SchemaToType } from "../../utils/joi";

export const CitySchema = Joi.object({
	_id: Joi.objectId().required(),
	name: Joi.string().required(),
	createdAt: Joi.date().required(),
	updatedAt: Joi.date().required(),
});
export type ICity = SchemaToType<typeof CitySchema>;
