import { IDateTracking } from './date_tracking.interface';
import { ISoftDelete } from './soft_delete.interface';
import { IUserTracking } from './user_tracking.interface';

export interface IAuditable extends IDateTracking, IUserTracking, ISoftDelete {}
