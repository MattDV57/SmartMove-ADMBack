import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { handleClaimCreated, processEvent } from './listeners.js';
import { configClient } from '../configClient.js';

const sqsClient = new SQSClient(configClient);


//TODO: A ELIMINAR ESTO... cuando se implement la lambda
export const pollQueue = async () => {
  const params = {
    QueueUrl: process.env.SQS_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  };


  const pollMessages = async () => {
    try {
      const command = new ReceiveMessageCommand(params);
      const response = await sqsClient.send(command); 
    
      if (!response) return
    

      if (response.Messages) {
        for (const message of response.Messages) {
          await processEvent(message); 

          const deleteParams = {
            QueueUrl: process.env.SQS_URL,
            ReceiptHandle: message.ReceiptHandle,
          };
          const deleteCommand = new DeleteMessageCommand(deleteParams);
          await sqsClient.send(deleteCommand);
        }
      }
    } catch (error) {
      console.error("Error al procesar mensajes de SQS:", error);
    }
  };

  
  setInterval(pollMessages, 5000)
};

