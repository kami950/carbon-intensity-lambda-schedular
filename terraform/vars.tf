variable "AWS_REGION" {
  default = "eu-west-2"
}

variable "STAGE" {
  description = "Stage name you want to append to all infrastructure."
}

variable "PROJECT_NAME" {
  description = "Name of the project"
}

variable "LAMBDA_RUNTIME" {
  default = "nodejs12.x"
}

variable "CARBON_INTENSITY_API" {
  description = "The Carbon Intensity API URL to be used."
}

variable "CARBON_INTENSITY_API_REGION_ID" {
  description = "The Carbon Intensity API region ID to be used."
}
