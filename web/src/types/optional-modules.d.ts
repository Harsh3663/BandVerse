declare module "ioredis" {
  const Redis: new (url: string) => {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode: string, ttl: number): Promise<unknown>;
    del(...keys: string[]): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    sadd(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    quit(): Promise<string>;
  };
  export default Redis;
}

declare module "bullmq" {
  export class Queue {
    constructor(name: string, options: { connection: { url: string } });
    add(
      name: string,
      data: unknown,
      opts?: { delay?: number; attempts?: number },
    ): Promise<{ id?: string }>;
    count(): Promise<number>;
  }
}
