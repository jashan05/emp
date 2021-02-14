var _ = require('lodash');

export async function validateExecutionPolicy(operatorEvent: object, executionPolicy: object): Promise<Boolean> {
    console.log('Validating operatorEvent and executionPolicy');
    return _.isEqual(executionPolicy, operatorEvent);
};