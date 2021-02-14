#!/bin/bash

set -e

echo -e "\n************** Setting Environment variables **************"
export ACCOUNT_ID='908306007056'
export AWS_REGION='eu-west-1'
export AWS_DEFAULT_REGION=${AWS_REGION}

echo -e "\n************** Clean-up **************"
rm -rf cdk/cdk.out

echo -e "\n************** Building lambda functions **************"
cd ./lambda/
tsc
cd -


echo -e "\n************** Check if S3 deployment Bucket exists **************"
CMD="$(which aws) s3api head-bucket --bucket $ACCOUNT_ID-cdk-cloud-blocks"
echo ">> $CMD"
if [[ $($CMD 2>&1) ]]; then
    echo ">> Bucket doesn't exist, running bootstrap"
    npx cdk bootstrap ${ACCOUNT_ID}/${AWS_REGION} \
    --toolkit-bucket-name=${ACCOUNT_ID}-cdk-cloud-blocks \
    --public-access-block-configuration=false
else
    echo ">> Bucket [$ACCOUNT_ID-cdk-cloud-blocks] exists(skipping bootstrap...) "
fi

echo -e  "\n************** CDK synthesize **************"
npx cdk synth

echo -e  "\n************** CDK Deploy **************"
npx cdk deploy --require-approval never

echo -e  "\n************** CleanUp **************"
rm -rf cdk.out
rm -rf ./lambda/src/*