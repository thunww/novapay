resource "aws_security_group" "redis" {
  name        = "${var.project_name}-sg-redis"
  description = "ElastiCache Redis security group"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.eks_sg_id]
  }

  tags = {
    Name = "${var.project_name}-sg-redis"
  }
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet"
  subnet_ids = var.data_subnet_ids

  tags = {
    Name = "${var.project_name}-redis-subnet"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${var.project_name}-redis"
  description          = "${var.project_name} Redis"

  node_type            = var.node_type
  num_cache_clusters   = 1
  engine               = "redis"
  engine_version       = "7.1"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = false
  transit_encryption_enabled = false

  tags = {
    Name = "${var.project_name}-redis"
  }
}
