import { GroupsActionTypes } from "../actions/groups";
import { ADD_GROUP, DELETE_GROUP, CHANGE_GROUP_NAME } from "../action-types";

export const todoGroupsReducer = (state: IStateGroups = {}, action: GroupsActionTypes): IStateGroups => {
    
    switch(action.type) {
        case ADD_GROUP:
            const newId = Math.max(...Object.keys(state).map(gId => +gId), 0) + 1;
            return {...state, [newId]: { id: newId, name: action.name, taskIds: [], }};
        case DELETE_GROUP:
            const newState = {...state};
            delete newState[action.id];
            return newState;
        case CHANGE_GROUP_NAME:
            if (!state[action.id]) return state;
            const newState2 = {...state};
            newState2[action.id] = { ...newState2[action.id]!, name: action.name };
            return newState2;
        default:
            return state;
    }
}

export interface IGroup {
    id: number;
    name: string;
    taskIds: number[];
};

export type IStateGroups = {
    [id: number]: IGroup | undefined;
};
