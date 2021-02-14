import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import Emp = require('../lib/emp-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Emp.EmpStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
