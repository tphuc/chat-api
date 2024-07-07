provider "aws" {
  region = "us-east-1"  # Specify your desired AWS region
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow HTTP inbound traffic"
  
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Optionally, you can add more rules here as needed.
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"  # Specify your desired Amazon Linux 2 AMI ID
  instance_type = "t2.micro"              # Specify your desired instance type
  
  # Attach the security group to the instance
  vpc_security_group_ids = [aws_security_group.web.id]
  
  # Specify user data to install Docker, Docker Compose, and run the Docker Compose file
  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo amazon-linux-extras install docker -y
              sudo service docker start
              sudo usermod -a -G docker ec2-user
              sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              sudo chmod +x /usr/local/bin/docker-compose
              sudo cat > /home/ec2-user/docker-compose.yml <<-EOL
              version: '3.8'
              services:
                chat-api:
                  build:
                    context: .
                    dockerfile: Dockerfile
                  ports:
                    - '3000:3000'
                  environment:
                    - REDIS_HOST=redis
                    - REDIS_PORT=6379
                  depends_on:
                    - redis

                redis:
                  image: 'redis:alpine'
                  ports:
                    - '6379:6379'
              EOL
              cd /home/ec2-user
              sudo docker-compose up -d
              EOF
              
  # Tag the instance
  tags = {
    Name = "chat-api-instance"
  }

  # Ensure the instance has a key pair for SSH access
  key_name = "your-key-pair-name"  # Replace with your key pair name
}
