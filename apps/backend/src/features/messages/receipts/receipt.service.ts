import * as queries from './internal/receipt.queries';


export const createMessageReceipt = async ({
  message_id,
  user_id,
  status
}: {
  message_id: number,
  user_id: number,
  status: 'sent' | 'delivered' | 'read'
}) => {
  const messageReceipt = await queries.insertMessageReceipt({
    message_id,
    user_id,
    status
  });
  return messageReceipt;
}
