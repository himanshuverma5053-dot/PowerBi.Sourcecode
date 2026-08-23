import { TyreProduct, Order } from '../types/index.js';
import { SEED_PRODUCTS } from '../data/seedProducts.js';

export const TABLE_NAMES = {
  PRODUCTS: process.env.PRODUCTS_TABLE || 'magadh-tyres-products-prod',
  ORDERS: process.env.ORDERS_TABLE || 'magadh-tyres-orders-prod',
  PAYMENTS: process.env.PAYMENTS_TABLE || 'magadh-tyres-payments-prod',
  COUPONS: process.env.COUPONS_TABLE || 'magadh-tyres-coupons-prod',
  BUCKET: process.env.MEDIA_BUCKET || 'magadh-tyres-media-prod'
};

export class DynamoDbService {
  private isAWSAvailable(): boolean {
    return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV || process.env.PRODUCTS_TABLE);
  }

  // PRODUCTS
  async getAllProducts(): Promise<TyreProduct[]> {
    if (!this.isAWSAvailable()) return SEED_PRODUCTS;
    try {
      // Dynamic import to support both local development and AWS Lambda
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
      const region = process.env.AWS_REGION || 'ap-south-1';
      const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
      const response = await doc.send(new ScanCommand({ TableName: TABLE_NAMES.PRODUCTS }));
      return (response.Items as TyreProduct[]) || [];
    } catch (err) {
      console.warn('DynamoDB scan notice, using catalogue:', err);
      return SEED_PRODUCTS;
    }
  }

  async getProductById(id: string): Promise<TyreProduct | null> {
    if (!this.isAWSAvailable()) {
      return SEED_PRODUCTS.find(p => p.id === id || p.sku === id) || null;
    }
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, GetCommand } = await import('@aws-sdk/lib-dynamodb');
      const region = process.env.AWS_REGION || 'ap-south-1';
      const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
      const response = await doc.send(
        new GetCommand({
          TableName: TABLE_NAMES.PRODUCTS,
          Key: { id }
        })
      );
      return (response.Item as TyreProduct) || null;
    } catch (err) {
      console.error('DynamoDB GetProduct error:', err);
      return null;
    }
  }

  async putProduct(product: TyreProduct): Promise<TyreProduct> {
    if (this.isAWSAvailable()) {
      try {
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');
        const region = process.env.AWS_REGION || 'ap-south-1';
        const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
        await doc.send(
          new PutCommand({
            TableName: TABLE_NAMES.PRODUCTS,
            Item: product
          })
        );
      } catch (err) {
        console.error('DynamoDB PutProduct error:', err);
      }
    }
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (this.isAWSAvailable()) {
      try {
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
        const region = process.env.AWS_REGION || 'ap-south-1';
        const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
        await doc.send(
          new DeleteCommand({
            TableName: TABLE_NAMES.PRODUCTS,
            Key: { id }
          })
        );
      } catch (err) {
        console.error('DynamoDB DeleteProduct error:', err);
      }
    }
    return true;
  }

  // ORDERS
  async getAllOrders(): Promise<Order[]> {
    if (!this.isAWSAvailable()) return [];
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
      const region = process.env.AWS_REGION || 'ap-south-1';
      const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
      const response = await doc.send(new ScanCommand({ TableName: TABLE_NAMES.ORDERS }));
      return (response.Items as Order[]) || [];
    } catch (err) {
      console.error('DynamoDB scan orders error:', err);
      return [];
    }
  }

  async putOrder(order: Order): Promise<Order> {
    if (this.isAWSAvailable()) {
      try {
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');
        const region = process.env.AWS_REGION || 'ap-south-1';
        const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
        await doc.send(
          new PutCommand({
            TableName: TABLE_NAMES.ORDERS,
            Item: order
          })
        );
      } catch (err) {
        console.error('DynamoDB PutOrder error:', err);
      }
    }
    return order;
  }

  async updateOrderStatus(id: string, newStatus: string): Promise<boolean> {
    if (!this.isAWSAvailable()) return true;
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
      const region = process.env.AWS_REGION || 'ap-south-1';
      const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
      await doc.send(
        new UpdateCommand({
          TableName: TABLE_NAMES.ORDERS,
          Key: { id },
          UpdateExpression: 'SET orderStatus = :status, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':status': newStatus,
            ':updatedAt': new Date().toISOString()
          }
        })
      );
      return true;
    } catch (err) {
      console.error('DynamoDB updateOrderStatus error:', err);
      return false;
    }
  }
}

export const dynamoDbService = new DynamoDbService();
