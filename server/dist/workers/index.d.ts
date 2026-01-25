import { Queue } from 'bullmq';
export declare const emailQueue: Queue<any, any, string, any, any, string>;
export declare const whatsappQueue: Queue<any, any, string, any, any, string>;
export declare const blockchainQueue: Queue<any, any, string, any, any, string>;
export declare const aiQueue: Queue<any, any, string, any, any, string>;
export declare function initWorkers(): Promise<void>;
//# sourceMappingURL=index.d.ts.map