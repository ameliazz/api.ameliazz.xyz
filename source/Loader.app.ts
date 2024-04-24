import Mozz from 'mozz.env'
import { readRoutes } from '@/utils/readdir.util'

export const Enhancer = new Mozz()
export const loadRoutes = readRoutes
