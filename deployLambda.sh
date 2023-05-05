#!/usr/bin/env bash

cd ./terraform
rm -rf .terraform
terraform init --backend-config=./backend.tfvars && terraform plan -out plan.tfplan && terraform apply plan.tfplan
cd ..