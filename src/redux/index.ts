import { combineReducers } from "redux";
import { todoGroupsReducer, IStateGroups } from "./reducers/groups";
import { todoTasksReducer, IStateTasks } from "./reducers/tasks";
import { GroupsActionTypes } from "./actions/groups";
import { TasksActionTypes } from "./actions/tasks";

export const rootReducer = combineReducers({
    groups: todoGroupsReducer,
    tasks: todoTasksReducer
});

export interface IRootState {
    groups: IStateGroups;
    tasks: IStateTasks;
}

export type IRootActions = TasksActionTypes | GroupsActionTypes;