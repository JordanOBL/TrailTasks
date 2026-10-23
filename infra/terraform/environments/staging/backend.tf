terraform {
  backend "s3" {
    bucket       = "trailtasks-terraform-state-890129487844"
    key          = "staging/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
