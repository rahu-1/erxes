import {
  putCreateLog as putCreateLogC,
  putDeleteLog as putDeleteLogC,
  putUpdateLog as putUpdateLogC
} from 'erxes-api-utils';
import * as _ from 'underscore';

import { IUserDocument } from '../db/models/definitions/users';
import messageBroker from '../messageBroker';
import { RABBITMQ_QUEUES } from './constants';

import { registerOnboardHistory } from './utils';

export type LogDesc = {
  [key: string]: any;
} & { name: any };

/**
 * @param object - Previous state of the object
 * @param newData - Requested update data
 * @param updatedDocument - State after any updates to the object
 */
export interface ILogDataParams {
  type: string;
  description?: string;
  object: any;
  newData?: object;
  extraDesc?: object[];
  updatedDocument?: any;
}

export interface IActivityLogQueryParams {
  contentId?: any;
  contentType?: string;
  action?: any;
}

interface IDescriptions {
  description?: string;
  extraDesc?: LogDesc[];
}

interface IDescriptionParams {
  action: string;
  type: string;
  obj: any;
  updatedDocument?: any;
}

const gatherDescriptions = async (
  _params: IDescriptionParams
): Promise<IDescriptions> => {
  return { extraDesc: [], description: '' };
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putCreateLog = async (
  params: ILogDataParams,
  user: IUserDocument
) => {
  await registerOnboardHistory({ type: `${params.type}Create`, user });

  // await sendToWebhook(LOG_ACTIONS.CREATE, params.type, params);

  messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
    type: `${params.type}`,
    targets: [params.object]
  });

  return putCreateLogC(messageBroker, gatherDescriptions, params, user);
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putUpdateLog = async (
  params: ILogDataParams,
  user: IUserDocument
) => {
  // await sendToWebhook(LOG_ACTIONS.UPDATE, params.type, params);

  messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
    type: `${params.type}`,
    targets: [params.updatedDocument]
  });

  return putUpdateLogC(messageBroker, gatherDescriptions, params, user);
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putDeleteLog = async (
  params: ILogDataParams,
  user: IUserDocument
) => {
  // await sendToWebhook(LOG_ACTIONS.DELETE, params.type, params);

  messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
    type: `${params.type}`,
    targets: [params.object]
  });

  return putDeleteLogC(messageBroker, gatherDescriptions, params, user);
};

export const sendToLog = (channel: string, data) =>
  messageBroker().sendMessage(channel, data);

interface IActivityLogParams {
  action: string;
  data: any;
}

export const putActivityLog = async (params: IActivityLogParams) => {
  const { data } = params;

  try {
    if (data.target) {
      messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
        type: `${data.contentType}`,
        targets: [data.target]
      });
    }

    return messageBroker().sendMessage('putActivityLog', params);
  } catch (e) {
    return e.message;
  }
};