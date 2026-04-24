import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface IStorageService {
  saveImage(buffer: Buffer, ext: string): Promise<string /* public URL path */>;
  deleteImage?(url: string): Promise<void>; // opcional para MVP
}

export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;
  private readonly publicPath: string;

  constructor(uploadDir?: string, publicPath?: string) {
    this.uploadDir = uploadDir ?? path.join(process.cwd(), "uploads");
    this.publicPath = publicPath ?? "/static";
  }

  async saveImage(buffer: Buffer, ext: string): Promise<string> {
    const clean = ext.replace(/^\./, "").toLowerCase();
    const filename = `${uuidv4()}.${clean}`;
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.writeFile(path.join(this.uploadDir, filename), buffer);
    return `${this.publicPath}/${filename}`;
  }

  async deleteImage(url: string): Promise<void> {
    const filename = url.split("/").pop();
    if (!filename) return;
    const fullPath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(fullPath);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }
  }
}

// Stub para MVP 1.x — no implementado. Queda la interfaz.
export class S3StorageService implements IStorageService {
  async saveImage(_buffer: Buffer, _ext: string): Promise<string> {
    throw new Error("S3StorageService not implemented yet (MVP 1.x)");
  }
}

let instance: IStorageService | undefined;
export function getStorageService(): IStorageService {
  if (!instance) {
    const driver = (process.env.STORAGE_DRIVER ?? "local").toLowerCase();
    if (driver === "s3") instance = new S3StorageService();
    else instance = new LocalStorageService();
  }
  return instance;
}
