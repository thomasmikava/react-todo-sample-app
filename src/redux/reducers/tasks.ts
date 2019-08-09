import { TasksActionTypes } from "../actions/tasks";
import { ADD_TASK, DELETE_TASK } from "../action-types";

export const todoTasksReducer = (state: IStateTasks = {}, action: TasksActionTypes): IStateTasks => {
    switch(action.type) {
        case ADD_TASK:
            return state;
        case DELETE_TASK:
            const newState = {...state};
            delete newState[action.id];
            return newState;
        default:
            return state;
    }
}

export type IStateTasks = {
    [id: number]: {
        id: number;
        name: string;
        isDone: boolean
    } | undefined;
};
