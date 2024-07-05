import Mozz from 'mozz.env'
import { readRouters } from '@utils/readdir.util'

export const Enhancer = new Mozz()
export const loadRouters = readRouters
