import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { processEvent } from './listeners.js';
import 'dotenv/config';

const sqsClient = new SQSClient({
  region: 'us-east-1',  
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,  
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  
  },
});

export const pollQueue = async () => {
  const params = {
    QueueUrl: process.env.SQS_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  };


  const pollMessages = async () => {
    try {
      console.log("BEFORE COMMAND")
      const command = new ReceiveMessageCommand(params);
      console.log("COMMANDDDDDd", command)
      const response = await sqsClient.send(command); 
      console.log("RESPONSE", response)
      if (!response) return

      if (response.Messages) {
        for (const message of response.Messages) {
          await processEvent(message); // Procesar el mensaje
          
          // Después de procesar, eliminar el mensaje de la cola
          const deleteParams = {
            QueueUrl: process.env.SQS_URL,
            ReceiptHandle: message.ReceiptHandle,
          };
          const deleteCommand = new DeleteMessageCommand(deleteParams);
          await sqsClient.send(deleteCommand); // Eliminar el mensaje
        }
      }
    } catch (error) {
      console.error("Error al procesar mensajes de SQS:", error);
    }
  };

  
  setInterval(pollMessages, 10000)
};
