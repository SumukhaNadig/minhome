import { Request, Response, NextFunction } from 'express'
import { TaskDefinition } from '../models/TaskDefinition'
import {
  createTaskDefinitionBody,
  updateTaskDefinitionBody,
} from '../validations/taskDefinition'
import { objectIdParam } from '../validations/common'
import { NotFoundError } from '../errors'

export const TaskDefinitionController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await TaskDefinition.find().sort({ name: 1 }))
    } catch (e) { next(e) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createTaskDefinitionBody.parse(req.body)
      const created = await TaskDefinition.create(body)
      res.status(201).json(created)
    } catch (e) { next(e) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = objectIdParam.parse(req.params)
      const def = await TaskDefinition.findById(id)
      if (!def) throw new NotFoundError('TaskDefinition', id)
      res.json(def)
    } catch (e) { next(e) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = objectIdParam.parse(req.params)
      const body = updateTaskDefinitionBody.parse(req.body)
      const updated = await TaskDefinition.findByIdAndUpdate(id, { $set: body }, { new: true })
      if (!updated) throw new NotFoundError('TaskDefinition', id)
      res.json(updated)
    } catch (e) { next(e) }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = objectIdParam.parse(req.params)
      const deleted = await TaskDefinition.findByIdAndDelete(id)
      if (!deleted) throw new NotFoundError('TaskDefinition', id)
      res.status(204).end()
    } catch (e) { next(e) }
  },
}
