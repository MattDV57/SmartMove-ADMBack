import 'dotenv/config'
import express from 'express'
import { checkApiKey } from '../middlewares/authz.middleware.js';
import { processEvent } from './sqs/listeners.js';


const router = express.Router()


router.post("/process-message", checkApiKey, async (req, res) => {
    try {
        const message = req.body;

        await processEvent(message);

        res.status(200).send({ success: true, message: 'Mensaje procesado exitosamente.' });
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
      res.status(500).send({ success: false, message: 'Error al procesar el mensaje.' });
    }
})


export default router
