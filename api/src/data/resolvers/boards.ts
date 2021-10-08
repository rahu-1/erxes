import { Pipelines } from '../../db/models';
import { IBoardDocument } from '../../db/models/definitions/boards';
import { IContext } from '../types';

export default {
  pipelines(board: IBoardDocument, {}, { user }: IContext) {
    if (board.pipelines) {
      return board.pipelines;
    }

    if (user.isOwner) {
      return Pipelines.find({ boardId: board._id });
    }

    return Pipelines.find({
      $and: [
        { boardId: board._id },
        {
          $or: [
            { visibility: 'public' },
            {
              $and: [
                { visibility: 'private' },
                {
                  $or: [
                    {
                      $and: [
                        { condition: 'include' },
                        {
                          $or: [{ memberIds: user._id }, { userId: user._id }]
                        }
                      ]
                    },
                    {
                      $and: [
                        { condition: 'exclude' },
                        {
                          $or: [
                            { excludMemberIds: user._id },
                            { userId: user._id }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
  }
};
