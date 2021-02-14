import AWS = require('aws-sdk');
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';
import * as config from "./config";

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: "eu-west-1",
    convertEmptyValues: true
});

/** Publish records 
 * @param { object } record: execution plan to be injected to DB
 */

export async function publishRecords(record: object): Promise<void> {
    try {
        const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: config.DYNAMODB_TABLENAME,
            Item: record,
        };
        await dynamoDb.put(params).promise();
    }
    catch (err) {
        throw err.message
    }
};

/** Fetch records 
 * @param { number } ppk: Primary Partition key of DynamoDB table
 * @param { number } psk: Primary Sort key of DynamoDB table
 */
export async function fetchRecords(ppk: number, psk: number): Promise<GetItemOutput> {
    try {
        const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: config.DYNAMODB_TABLENAME,
            Key: {
                'orderId': ppk,
                'operatorId': psk
            }
        };
        return await dynamoDb.get(params).promise();
    }
    catch (err) {
        throw err.message
    }
};

/** Update records in DynamoDB
 * @param { number } ppk: Primary Partition key of DynamoDB table
 * @param { number } psk: Primary Sort key of DynamoDB table
 * @param { object } record: Record which needs to be updated
 */
export async function updateRecords(ppk: number, psk: number, record: object): Promise<GetItemOutput> {
    try {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: config.DYNAMODB_TABLENAME,
            Key: {
                'orderId': ppk,
                'operatorId': psk
            },
            UpdateExpression: 'set nestedJson = :newrecord',
            ExpressionAttributeValues: { ':newrecord': record },
        };
        return await dynamoDb.update(params).promise();
    }
    catch (err) {
        throw err.message
    }
};