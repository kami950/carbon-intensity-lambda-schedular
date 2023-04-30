# carbon-intensity-lambda-schedular
An AWS Lambda which interacts with the Carbon Intensity API to schedule when it will run the following day. https://carbon-intensity.github.io/api-definitions/#carbon-intensity-api-v2-0-0


## Getting started
To deploy your lambda there's a few things you need to do:
1. Populate the `./terraform/terraform.tfvars` file with the following:
    * STATGE - Prefix for all infrastructure
    * PROJECT_NAME - All infrastructure will contain this name
    * CARBON_INTENSITY_API - The URL of the Carbon intensity API.[Documentation can be found here](https://carbon-intensity.github.io/api-definitions/#carbon-intensity-api-v2-0-0)
    * CARBON_INTENSITY_API_REGION_ID - The region ID we will be collecting information for. [Regions can be found here](https://carbon-intensity.github.io/api-definitions/#region-list)
2. In the `./terraform/backend.tfvars` you will want to populate information on your aws S3 remote state. For more information on remote state and to create one see [kami950/terraform-remote-state](https://github.com/kami950/terraform-remote-state)
3. Following this you are ready to deploy your lambda by running the `deployLambda.sh` script
4. If you want to destroy lambda and the created resources then you can use the `destroyLambda.sh` script

## Technical information 
This project will provision the following:
* An AWS Lambda with the following naming convention: {STAGE}-{PROJECT_NAME}lambda
* A Lambda role with the following name: {STAGE}-{PROJECT_NAME}-role
* A Lambda policy with the following name: {STAGE}-{PROJECT_NAME}}-role-policy
    * This policy has two rules:
        * Allowed all permissions for Logs
        * Allowed to PutRule on any Events resource

You are able to delete these in the AWS console if there's any issues with the created remote state.

The applicaiton will query the carbon intensity of the selected region, and attempt to pick a time frame with the lowest carbon intensity. Working form very low, low, moderate, high to very high, and selecting the forcast with the lowest number in those areas. Ideal would  be to select the lowest number in very low.