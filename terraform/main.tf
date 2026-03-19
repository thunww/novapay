module "vpc" {
  source = "./modules/vpc"

  project_name        = var.project_name
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidrs = var.public_subnet_cidrs
  app_subnet_cidrs    = var.app_subnet_cidrs
  data_subnet_cidrs   = var.data_subnet_cidrs
  availability_zones  = var.availability_zones
}

module "eks" {
  source = "./modules/eks"

  project_name           = var.project_name
  vpc_id                 = module.vpc.vpc_id
  app_subnet_ids         = module.vpc.app_subnet_ids
  public_subnet_ids      = module.vpc.public_subnet_ids
  eks_cluster_version    = var.eks_cluster_version
  node_instance_type     = var.eks_node_instance_type
  node_desired_size      = var.eks_node_desired_size
  node_min_size          = var.eks_node_min_size
  node_max_size          = var.eks_node_max_size
}

module "rds" {
  source = "./modules/rds"

  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  data_subnet_ids = module.vpc.data_subnet_ids
  eks_sg_id       = module.eks.cluster_security_group_id
  instance_class  = var.rds_instance_class
  username        = var.rds_username
  password        = var.rds_password
}

module "elasticache" {
  source = "./modules/elasticache"

  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  data_subnet_ids = module.vpc.data_subnet_ids
  eks_sg_id       = module.eks.cluster_security_group_id
  node_type       = var.redis_node_type
}
