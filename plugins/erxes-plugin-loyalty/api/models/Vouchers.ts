import { checkVouchersSale, confirmVoucherSale } from '../utils';
import { changeScoreOwner, commonSchema } from './CompaignUtils';
import { VOUCHER_STATUS } from './Constants';

export const voucherSchema = {
  ...commonSchema,

  status: { type: String, enum: VOUCHER_STATUS.ALL, default: 'new', label: 'Status' },
  bonusInfo: { type: Object, optional: true, label: 'Bonus log' }
};

export const voucherCompoundIndexes = {
  status: 1,
  customerId: 1
}

export class Voucher {
  public static async getVoucher(models, _id: string) {
    const voucherRule = await models.Voucher.findOne({ _id });

    if (!voucherRule) {
      throw new Error('not found voucher rule')
    }

    return voucherRule;
  }

  public static async getVouchers(models, { ownerType, ownerId, statuses }: { ownerType: string, ownerId: string, statuses: string[] }) {
    return await models.Vouchers.find({ ownerType, ownerId, status: { $in: statuses || [] } }).lean()
  }

  public static async createVoucher(models, { compaignId, ownerType, ownerId, userId = '' }) {
    if (!ownerId || !ownerType) {
      throw new Error('Not create voucher, owner is undefined');
    }

    const voucherCompaign = await models.VoucherCompaigns.getVoucherCompaign(models, compaignId);

    const now = new Date();

    if (voucherCompaign.startDate > now || voucherCompaign.endDate < now) {
      throw new Error('Not create spin, expired');
    }

    switch (voucherCompaign.voucherType) {
      case 'spin':
        return models.Spins.createSpin(models, { compaignId: voucherCompaign.spinCompaignId, ownerType, ownerId, voucherCompaignId: compaignId, userId });
      case 'lottery':
        return models.Lotteries.createLottery(models, { compaignId: voucherCompaign.lotteryCompaignId, ownerType, ownerId, voucherCompaignId: compaignId, userId });
      case 'score':
        return changeScoreOwner(models, { ownerType, ownerId, changeScore: voucherCompaign.score });
      case 'discount':
      case 'bonus':
      case 'coupon':
      default:
        return models.Vouchers.create({ compaignId, ownerType, ownerId, createdAt: now, status: VOUCHER_STATUS.NEW, userId });
    }
  }

  public static async updateVoucher(models, _id, { ownerType, ownerId, status, userId = '' }) {
    if (!ownerId || !ownerType) {
      throw new Error('Not create voucher, owner is undefined');
    }

    const voucher = await models.Vouchers.findOne({ _id }).lean();
    const compaignId = voucher.compaignId;

    await models.VoucherCompaigns.getVoucherCompaign(models, compaignId);

    const now = new Date();

    return models.Vouchers.updateOne({ _id }, { $set: { compaignId, ownerType, ownerId, modifiedAt: now, status, userId } });

  }

  public static async buyVoucher(models, { compaignId, ownerType, ownerId, count = 1 }) {
    if (!ownerId || !ownerType) {
      throw new Error('can not buy voucher, owner is undefined');
    }

    const voucherCompaign = await models.VoucherCompaigns.getVoucherCompaign(models, compaignId);

    if (!voucherCompaign.buyScore) {
      throw new Error('can not buy this voucher');
    }

    await changeScoreOwner(models, { ownerType, ownerId, changeScore: -1 * voucherCompaign.buyScore * count });

    return models.Vouchers.createVoucher(models, { compaignId, ownerType, ownerId });
  }

  public static async removeVouchers(models, _ids: string[]) {
    return models.Vouchers.deleteMany({ _id: { $in: _ids } })
  }

  public static async checkVouchersSale(models, { ownerType, ownerId, products }) {
    return checkVouchersSale(models, ownerType, ownerId, products);
  }

  public static async confirmVoucherSale(models, { checkInfo }) {
    return confirmVoucherSale(models, checkInfo);
  }
}
