//dot env

import dotenv from "dotenv";

// S3FileManager.ts

import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
  paginateListObjectsV2,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


interface File {
  key: string;
  size: number;
  url: string;
}

interface Folder {
  key: string;
  size: number;
  url: string;
}

interface ListResult {
  folders?: Folder[];
  files: File[];
  continuationToken?: string | null;
}

// for testing add keys here
const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY ?? "";


export default class S3FileManager {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(bucketName: string, region: string) {
    this.s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    this.bucketName = bucketName;
    this.region = region;
  }

  async listFiles(
    prefix = "",
    delimiter = "/",
    continuationToken = null
  ): Promise<ListResult> {
    try {
      const data = await this.s3Client.send(
        new ListObjectsV2Command({
          MaxKeys: 10,
          Bucket: this.bucketName,
          Prefix: prefix,
          Delimiter: delimiter,
          ContinuationToken: continuationToken ? continuationToken : undefined,
        })
      );

      const folders: Folder[] = [];
      const files: File[] = [];

      if (data.CommonPrefixes) {
        for (const commonPrefix of data.CommonPrefixes) {
          if (commonPrefix.Prefix) {
            const folder: Folder = {
              key: commonPrefix.Prefix,
              size: 0,
              url: "/folder.png",
            };
            folders.push(folder);
          }
        }
      }

      if (data.Contents) {
        for (const content of data.Contents) {
          if (content.Key && !content.Key.endsWith("/")) {
            const file: File = {
              key: content.Key,
              size: content.Size || 0,
              url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${content.Key}`,
            };
            files.push(file);
          }
        }
      }

      return { folders, files, continuationToken: data.NextContinuationToken };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async createFolder(key: string): Promise<void> {
    try {
      if (!key.endsWith("/")) {
        throw new Error("Folder name must end with /");
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: "",
      });
      await this.s3Client.send(command);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getFile(key: string): Promise<File> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const data = await this.s3Client.send(command);
      return {
        key: key,
        size: data.ContentLength || 0,
        url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async searchFiles(
    searchInput: string,
    prefix: string = ""
  ): Promise<ListResult> {
    let matchingKeys: File[] = [];
    try {
      for await (const page of paginateListObjectsV2(
        { client: this.s3Client, pageSize: 1000 },
        { Bucket: this.bucketName, Prefix: prefix }
      )) {
        if (page.Contents) {
          for (const content of page.Contents) {
            if (content.Key) {
              if (
                !content.Key.endsWith("/") &&
                content.Key.includes(searchInput)
              ) {
                console.log("key", content.Key);
                matchingKeys.push({
                  key: content.Key,
                  size: content.Size || 0,
                  url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${content.Key}`,
                });
              }
            }
          }
        }
      }
      return { files: matchingKeys };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async putFile(
    key: string,
    body: Blob,
    contentType: string = "image/png"
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
