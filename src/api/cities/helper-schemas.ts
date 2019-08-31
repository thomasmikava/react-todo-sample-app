import Joi, { SchemaToType } from "../../utils/joi";

export const CitySchema = Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
});
export type City = SchemaToType<typeof CitySchema>;
