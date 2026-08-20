import { TagResponse } from 'shared'
import { ErrorResponse } from '../../types/types'
import { Request, Response } from 'express'
import { getTags } from './tags.services'

export const getTagsHandler = (
  req: Request,
  res: Response<TagResponse | ErrorResponse>
) => {
  const tags = getTags()
  return res.status(200).json({ tags })
}
