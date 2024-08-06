import { IEntityBase } from '../interfaces/entity_base.iterface';
export declare abstract class EntityBase<T extends string> implements IEntityBase<T> {
    id: T;
}
