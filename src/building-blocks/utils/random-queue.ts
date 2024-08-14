import * as crypto from 'crypto';

export const randomQueueName = (): string => {
  return `iam.${crypto.randomBytes(10).toString('hex')}`;
};
