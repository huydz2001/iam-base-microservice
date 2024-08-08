import { Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { IEntityBase } from '../interfaces/entity_base.iterface';

@Entity()
export abstract class EntityBase<T extends string> implements IEntityBase<T> {
  @Index()
  @PrimaryGeneratedColumn('uuid')
  id: T;
}
