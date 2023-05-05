#!/usr/bin/env bash

cd ./terraform
rm -rf .terraform
terraform init -backend-config=./backend.tfvars && terraform destroy -auto-approve
cd ..