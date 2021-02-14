import { Construct, Stack, Duration, StackProps, CfnOutput, RemovalPolicy } from '@aws-cdk/core';
import iam = require("@aws-cdk/aws-iam");
import sns = require('@aws-cdk/aws-sns');
import sqs = require('@aws-cdk/aws-sqs');
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import cw = require('@aws-cdk/aws-cloudwatch');
import lambda = require('@aws-cdk/aws-lambda');
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { LambdaSubscription } from '@aws-cdk/aws-sns-subscriptions';

export class EmpStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        // SQS queue to store messages
        const sqs_queue = new sqs.Queue(this, 'executionPolicyQueue', {
            queueName: 'executionPolicyQueue',
            visibilityTimeout: Duration.seconds(60)
        });

        // DynamoDB table
        const table = new dynamodb.Table(this, 'executionPlanDB', {
            tableName: 'executionPlanDB',
            removalPolicy: RemovalPolicy.DESTROY,
            partitionKey: { name: 'orderId', type: dynamodb.AttributeType.NUMBER },
            sortKey: { name: 'operatorId', type: dynamodb.AttributeType.NUMBER }
        });
        // Lambda Function used for handling executionPolicy
        const processExecutionPlan = new lambda.Function(this, 'processExecutionPlan', {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset('lambda', { exclude: ['*.ts'] }),
            handler: 'src/empController.processExecutionPlan',
            functionName: 'processExecutionPlan',
            timeout: Duration.seconds(60),
            reservedConcurrentExecutions: 1,
            retryAttempts: 0,
        });

        // Add Policies to the role of Lambda
        processExecutionPlan.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ["*"],
            actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams", "sqs:*", "dynamodb:*", "sns:*", "cloudwatch:*"]
        }));

        // Add Alarm on the Lambda
        processExecutionPlan.metricErrors().createAlarm(this, 'processExecutionPlanAlarm', {
            threshold: 0,
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            period: Duration.minutes(1),
            alarmName: 'processExecutionPlanAlarm-alarm',
            treatMissingData: cw.TreatMissingData.MISSING,
            comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
        });

        // Add SQS queue as an event source for processExecutionPlan Lambda
        processExecutionPlan.addEventSource(new SqsEventSource(sqs_queue));

        // Lambda Function used for handling executionPolicy
        const processOperatorEvents = new lambda.Function(this, 'processOperatorEvents', {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset('lambda', { exclude: ['*.ts'] }),
            timeout: Duration.seconds(60),
            handler: 'src/empController.processOperatorEvents',
            functionName: 'processOperatorEvents',
            reservedConcurrentExecutions: 1,
            retryAttempts: 0,
        });

        // Add Policies to the role of Lambda
        processOperatorEvents.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ["*"],
            actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams", "sqs:*", "dynamodb:*", "sns:*", "cloudwatch:*"]
        }));

        // Add Alarm on the Lambda
        processOperatorEvents.metricErrors().createAlarm(this, 'processOperatorEventsAlarm', {
            threshold: 0,
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            period: Duration.minutes(1),
            alarmName: 'processOperatorEvents-alarm',
            treatMissingData: cw.TreatMissingData.MISSING,
            comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
        });

        // SNS for notifications
        const topic = new sns.Topic(this, 'operatorNotifications', {
            topicName: 'operatorNotifications',
            displayName: 'Operator Notifications for executions'
        });

        // Add processOperatorEvents Lambda as the subscription to SNS
        topic.addSubscription(new LambdaSubscription(processOperatorEvents));

        //Output of CFN resources
        new CfnOutput(this, 'processExecutionPlanLambdaArn', {
            value: processExecutionPlan.functionArn,
            exportName: 'processExecutionPlan-arn'
        });
        new CfnOutput(this, 'processExecutionPlanLambdaName', {
            value: processExecutionPlan.functionName,
            exportName: 'processExecutionPlan-name'
        });
        new CfnOutput(this, 'processOperatorEventsLambdaArn', {
            value: processOperatorEvents.functionArn,
            exportName: 'processOperatorEvents-arn'
        });
        new CfnOutput(this, 'processOperatorEventsLambdaName', {
            value: processOperatorEvents.functionName,
            exportName: 'processOperatorEvents-name'
        });
        new CfnOutput(this, 'DBName', {
            value: table.tableName,
            exportName: 'DynamoDb'
        });
    }
}
