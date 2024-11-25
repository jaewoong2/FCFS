import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  constructor() {}

  private s3 = new S3({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: process.env.AWS_BEDROCK_ACCESS_KEY,
      secretAccessKey: process.env.AWS_BEDROCK_SECRET_KEY,
    },
  });
  private bucketName = process.env.AWS_S3_BUCKET_NAME;

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const key = `images/${Date.now()}_${file.originalname}`;
    const params: S3.Types.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3.upload(params).promise();
    return `https://d3t7exr31xs1l7.cloudfront.net/${key}`; // 업로드된 파일의 URL 반환
  }
}
