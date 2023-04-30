provider "aws" {
  region = var.AWS_REGION
}

terraform {
  backend "s3" {}
}