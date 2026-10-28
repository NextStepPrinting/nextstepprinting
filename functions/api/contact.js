import {createMessageHandler} from '../_lib/message.js';
export const createContactHandler=(providerFetch=fetch)=>createMessageHandler('contact',providerFetch);
export const onRequest=createContactHandler();
