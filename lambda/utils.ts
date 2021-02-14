var _ = require('lodash');

/** Validates and compares the operator Event and execution policy
 * @param { object } operatorEvent: operator event object
 * @param { object } executionPolicy: execution object from db
 */
export async function validateExecutionPolicy(operatorEvent: object, executionPolicy: object): Promise<Boolean> {
    console.log('Validating operatorEvent and executionPolicy');
    return _.isEqual(executionPolicy, operatorEvent);
};