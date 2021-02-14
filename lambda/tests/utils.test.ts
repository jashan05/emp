import { expect } from 'chai';
import { ObjectFlags } from 'typescript';
import * as util from '../utils'


describe('positiveValidate', () => {
    it('positiveValidate', async () => {
        let execPolicy: object = JSON.parse('{ "a": "b", "c": { "d": "e" } }');
        let operatorEvent: object = JSON.parse('{ "a": "b", "c": { "d": "e" } }');
        let result: Boolean = await util.validateExecutionPolicy(execPolicy, operatorEvent);
        expect(result).to.be.true;
    })
})

describe('negativeValidate', () => {
    it('negativeValidate', async () => {
        let execPolicy: object = JSON.parse('{ "a": "b", "z": { "d": "e" } }');
        let operatorEvent: object = JSON.parse('{ "a": "b", "c": { "d": "e" } }');
        let result: Boolean = await util.validateExecutionPolicy(execPolicy, operatorEvent);
        console.log()
        expect(result).to.be.false;
    })
})