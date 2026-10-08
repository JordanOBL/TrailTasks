#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="890129487844"
ECR_REPO="trailtasks-api"
IMAGE_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
GIT_SHA="$(git rev-parse --short HEAD)"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login \
    --username AWS \
    --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

docker buildx build \
  --platform linux/amd64 \
  -t "${IMAGE_REPO}:${GIT_SHA}" \
  --push \
  ./api-server

terraform -chdir=infra/terraform/environments/staging fmt
terraform -chdir=infra/terraform/environments/staging validate
terraform -chdir=infra/terraform/environments/staging plan \
  -var="api_image_tag=${GIT_SHA}"

terraform -chdir=infra/terraform/environments/staging apply \
  -var="api_image_tag=${GIT_SHA}"