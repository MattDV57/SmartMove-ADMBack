import 'dotenv/config'
import { Log } from '../Models/logModel.js'

const logAction = async (eventType, moduleEmitter, performedBy) => {
  await Log.create({
    eventType,
    moduleEmitter,
    performedBy
  })
}

export default logAction
