import { IRGETCities, IAGETCity, IRGETCity, IAPUTCity, IRPUTCity, RGETCitiesSchema, RGETCitySchema, RPUTCitySchema } from "./validators";
import { IRequest } from "../requests";
import { inject } from "../../modules";

export class CitiesController {

    private Request: IRequest;
    private CityModel = inject("CityModel");

    constructor(request: IRequest) {
        this.Request = request;
    }

    getAll = async (): Promise<IRGETCities> => {
        return this.Request.send("GET", `/api/cities/`, undefined, null, {
            responseSchema: RGETCitiesSchema,
        }).then((cities: IRGETCities) => {
            this.CityModel.clearAllSync();
            this.CityModel.loadManySync(cities);
            return cities;
        });
    }

    getById = async (args: IAGETCity, loadFresh?: boolean): Promise<IRGETCity> => {
        if (!loadFresh) {
            const city = this.CityModel.findByIdSync(args.cityId, true);
            if (city) {
                return city;
            }
        }
        return this.Request.send("GET", `/api/cities/:cityId`, args, null, {
            responseSchema: RGETCitySchema
        }).then((city: IRGETCity) => {
            this.CityModel.loadOneSync(city);
            return city;
        });
    }

    changeById = async (args: IAPUTCity): Promise<IRPUTCity> => {
        return this.Request.send("PUT", `/api/cities/:cityId`, args, null, {
            requestSchema: RPUTCitySchema,
        }).then((city: IRPUTCity) => {
            this.CityModel.updateOneSync({ _id: city._id }, city);
            return city;
        });
    }
}
