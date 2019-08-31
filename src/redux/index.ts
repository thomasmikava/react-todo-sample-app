import { combineReducers } from "redux";
import { todoGroupsReducer, IStateGroups } from "./reducers/groups";
import { todoTasksReducer, IStateTasks } from "./reducers/tasks";
import { GroupsActionTypes } from "./actions/groups";
import { TasksActionTypes } from "./actions/tasks";
import { citiesReducer, IStateCities, CityActions } from "../models/city";

export const rootReducer = combineReducers({
    groups: todoGroupsReducer,
    tasks: todoTasksReducer,
    cities: citiesReducer,
});

export interface IRootState {
    groups: IStateGroups;
    tasks: IStateTasks;
    cities: IStateCities,
}

export type IRootActions = TasksActionTypes | GroupsActionTypes | CityActions;