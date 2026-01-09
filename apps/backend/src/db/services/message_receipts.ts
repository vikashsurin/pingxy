import * as queries from "../queries/index";
import * as services from '../services/index';


export const createMessageReceipt = async (message_id: number, user_id: number) => {
    const messageReceipt = await queries.createMessageReceipt(message_id, user_id);
    return messageReceipt;
}
