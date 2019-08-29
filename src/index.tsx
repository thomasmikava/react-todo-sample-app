import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore, Store } from "redux";
import { rootReducer, IRootState, IRootActions } from './redux';
import { addTaskAction } from './redux/actions/tasks';
import { Provider } from 'react-redux';
import { SatestoComponent, Staesto2 } from './hook-components';
import { Palitre } from './references';
import { Timer } from './hook-components/timer';
import Counter from './ravici';
import { ButtonsPage } from './buttons';
import { RegistrationForm } from './registration-form';

export const store: Store<IRootState, IRootActions> = 
    createStore(rootReducer);

const currentState = store.getState();
store.dispatch(addTaskAction("ხვალინდელი"));

ReactDOM.render(<Provider store={store}><RegistrationForm /></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
