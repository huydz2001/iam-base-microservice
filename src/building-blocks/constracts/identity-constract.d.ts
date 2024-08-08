import { IEvent } from '@nestjs/cqrs';
export declare class UserCreated implements IEvent {
    id: string;
    email: string;
    name: string;
    permissionIds: string[];
    groupIds: string[];
    phone: string;
    role: Role;
    createdAt: Date;
    updatedAt?: Date;
    constructor(partial?: Partial<UserCreated>);
}
export declare class UserDeleted implements IEvent {
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
    constructor(partial?: Partial<UserDeleted>);
}
export declare class UserUpdated implements IEvent {
    id: string;
    email: string;
    name: string;
    permissionIds: string[];
    groupIds: string[];
    phone: string;
    role: Role;
    createdAt: Date;
    updatedAt?: Date;
    constructor(partial?: Partial<UserUpdated>);
}
export declare enum Role {
    USER = 1,
    ADMIN = 2,
    GUEST = 0
}
