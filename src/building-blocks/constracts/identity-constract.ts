import { IEvent } from '@nestjs/cqrs';

export class UserCreated implements IEvent {
  id: string;
  email: string;
  password: string;
  name: string;
  permissionIds: string[];
  groupIds: string[];
  phone: string;
  role: Role;
  createdAt: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<UserCreated>) {
    Object.assign(this, partial);
  }
}

export class UserDeleted implements IEvent {
  id: string;
  email: string;
  password: string;
  name: string;
  permissionIds: string[];
  groupIds: string[];
  phone: string;
  role: Role;
  createdAt: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<UserDeleted>) {
    Object.assign(this, partial);
  }
}

export class UserUpdated implements IEvent {
  id: string;
  email: string;
  password: string;
  name: string;
  permissionIds: string[];
  groupIds: string[];
  phone: string;
  role: Role;
  createdAt: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<UserUpdated>) {
    Object.assign(this, partial);
  }
}

export enum Role {
  USER = 1,
  ADMIN = 2,
  GUEST = 0
}
