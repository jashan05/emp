import * as dbService from "./dbService";
import * as utils from "./utils";

/** Lambda Handler to process execution plan 
 * @param { any } event: message from SQS
 * @param { any } context: lambda context
 */
exports.processExecutionPlan = async function (event: any, context: any) {

    try {
        var message = JSON.parse(event.Records[0].body);
        let records: any = await dbService.fetchRecords(message.orderId, message.operatorId);
        if (records) {
            console.log('Updating records in table');
            await dbService.updateRecords(message.orderId, message.operatorId, message.nestedJson);
        } else {
            console.log('Injecting records in table');
            await dbService.publishRecords(message);
        }

    } catch (err) {
        console.log(err, err.stack);
        context.fail();
    }
};

/** Lambda Handler to process operator events 
 * @param { any } snsNotification: event from SNS
 * @param { any } context: lambda context
 */
exports.processOperatorEvents = async function (snsNotification: any, context: any) {

    try {
        var notification = JSON.parse(snsNotification.Records[0].Sns.Message);
        let records: any = await dbService.fetchRecords(notification.orderId, notification.operatorId);
        if (! await utils.validateExecutionPolicy(notification, records.Item)) {
            console.log('Call SES to fetch new records');
        }
    }
    catch (err) {
        console.log(err, err.stack);
        context.fail();
    }

}