declare module "ali-oss" {
  type PutResult = {
    name: string;
    url?: string;
  };

  type ClientOptions = {
    region: string;
    bucket: string;
    accessKeyId: string;
    accessKeySecret: string;
    endpoint?: string;
    secure?: boolean;
  };

  type PutOptions = {
    headers?: Record<string, string>;
  };

  class OSS {
    constructor(options: ClientOptions);
    put(name: string, file: Buffer, options?: PutOptions): Promise<PutResult>;
  }

  export default OSS;
}
