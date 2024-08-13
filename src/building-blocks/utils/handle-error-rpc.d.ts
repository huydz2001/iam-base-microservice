export declare class ReponseDto {
    message: string;
    name: string;
    constructor(item: Partial<ReponseDto>);
}
export declare const handleRpcError: (response: ReponseDto) => never;
