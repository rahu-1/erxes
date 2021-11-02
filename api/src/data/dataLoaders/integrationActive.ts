import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Integrations } from '../../db/models';

export default function generateDataLoader() {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await Integrations.find({
      _id: { $in: ids },
      isActive: { $ne: false }
    }).lean();
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}