import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import type { ObjectStorage } from './audio.types'

export class LocalObjectStorage implements ObjectStorage {
  constructor(
    private readonly rootDirectory: string,
    private readonly publicPath = '/api/v1/media',
  ) {}

  async upload(input: {
    key: string
    buffer: Buffer
    contentType: string
  }): Promise<void> {
    const destination = this.resolveKey(input.key)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, input.buffer)
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolveKey(key), { force: true })
  }

  getPublicUrl(key: string): string {
    return `${this.publicPath}/${encodeStorageKey(key)}`
  }

  private resolveKey(key: string): string {
    const destination = resolve(this.rootDirectory, key)
    const root = `${resolve(this.rootDirectory)}/`
    if (!destination.startsWith(root)) {
      throw new Error('Object storage key escapes the local storage directory')
    }
    return destination
  }
}

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client

  constructor(
    private readonly bucket: string,
    endpoint: string | undefined,
    accessKeyId: string,
    secretAccessKey: string,
    private readonly publicUrl: string,
    region: string,
  ) {
    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: Boolean(endpoint),
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  async upload(input: {
    key: string
    buffer: Buffer
    contentType: string
  }): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.buffer,
        ContentType: input.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    )
  }

  getPublicUrl(key: string): string {
    const base = this.publicUrl.endsWith('/')
      ? this.publicUrl
      : `${this.publicUrl}/`
    return new URL(encodeStorageKey(key), base).toString()
  }
}

function encodeStorageKey(key: string): string {
  return key
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}
