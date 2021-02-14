#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EmpStack } from './../lib/emp-stack';

const app = new cdk.App();
new EmpStack(app, 'EmpStack', {
    env: {
        account: <string>process.env.ACCOUNT_ID,
        region: <string>process.env.AWS_REGION
    }
});
