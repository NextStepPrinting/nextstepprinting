import {createMessageHandler} from '../_lib/message.js';
export const createQuoteHandler=(providerFetch=fetch)=>createMessageHandler('quote',providerFetch);
export const onRequest=createQuoteHandler();
