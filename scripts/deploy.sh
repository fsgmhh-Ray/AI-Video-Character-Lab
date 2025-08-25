#!/bin/bash

# AI Video Character Lab 部署脚本
# 使用方法: ./scripts/deploy.sh [dev|prod]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境
check_environment() {
    log_info "检查部署环境..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        log_warning "未找到.env文件，将使用env.example"
        cp env.example .env
        log_warning "请编辑.env文件配置必要的环境变量"
        read -p "按回车键继续..."
    fi
    
    log_success "环境检查完成"
}

# 构建镜像
build_images() {
    log_info "构建Docker镜像..."
    
    # 构建前端镜像
    log_info "构建前端镜像..."
    docker build -f frontend/Dockerfile.prod -t ai-video-lab-frontend:latest ./frontend
    
    # 构建后端镜像
    log_info "构建后端镜像..."
    docker build -f backend/Dockerfile.prod -t ai-video-lab-backend:latest ./backend
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    local env=${1:-dev}
    
    log_info "启动服务 (环境: $env)..."
    
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."
    
    # 等待数据库
    log_info "等待数据库就绪..."
    timeout 60 bash -c 'until docker exec ai-video-lab-db-1 pg_isready -U postgres; do sleep 2; done'
    
    # 等待Redis
    log_info "等待Redis就绪..."
    timeout 30 bash -c 'until docker exec ai-video-lab-redis-1 redis-cli ping; do sleep 2; done'
    
    # 等待后端API
    log_info "等待后端API就绪..."
    timeout 60 bash -c 'until curl -f http://localhost:8000/health; do sleep 2; done'
    
    # 等待前端
    log_info "等待前端就绪..."
    timeout 60 bash -c 'until curl -f http://localhost:3000; do sleep 2; done'
    
    log_success "所有服务已就绪"
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    docker exec ai-video-lab-backend-1 alembic upgrade head
    
    log_success "数据库迁移完成"
}

# 初始化数据
init_data() {
    log_info "初始化基础数据..."
    
    # 运行初始化SQL脚本
    docker exec -i ai-video-lab-db-1 psql -U postgres -d ai_video_lab < scripts/init.sql
    
    log_success "数据初始化完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 检查各服务状态
    services=("frontend" "backend" "db" "redis" "nginx")
    
    for service in "${services[@]}"; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service.*Up"; then
            log_success "$service 服务运行正常"
        else
            log_error "$service 服务异常"
            return 1
        fi
    done
    
    log_success "健康检查通过"
}

# 显示服务状态
show_status() {
    log_info "服务状态:"
    docker-compose ps
    
    log_info "服务日志:"
    docker-compose logs --tail=20
}

# 停止服务
stop_services() {
    local env=${1:-dev}
    
    log_info "停止服务 (环境: $env)..."
    
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    log_success "服务已停止"
}

# 清理资源
cleanup() {
    log_info "清理资源..."
    
    # 停止所有容器
    docker-compose down
    
    # 清理未使用的镜像
    docker image prune -f
    
    # 清理未使用的卷
    docker volume prune -f
    
    log_success "资源清理完成"
}

# 主函数
main() {
    local action=${1:-start}
    local env=${2:-dev}
    
    case $action in
        "start")
            check_environment
            build_images
            start_services $env
            wait_for_services
            run_migrations
            init_data
            health_check
            show_status
            log_success "部署完成！"
            log_info "前端地址: http://localhost:3000"
            log_info "后端API: http://localhost:8000"
            log_info "监控面板: http://localhost:9090"
            ;;
        "stop")
            stop_services $env
            ;;
        "restart")
            stop_services $env
            sleep 5
            start_services $env
            wait_for_services
            health_check
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            docker-compose logs -f
            ;;
        *)
            echo "使用方法: $0 [start|stop|restart|status|cleanup|logs] [dev|prod]"
            echo "  start   - 启动服务"
            echo "  stop    - 停止服务"
            echo "  restart - 重启服务"
            echo "  status  - 显示服务状态"
            echo "  cleanup - 清理资源"
            echo "  logs    - 查看日志"
            exit 1
            ;;
    esac
}

# 脚本入口
if [ "$0" = "$BASH_SOURCE" ]; then
    main "$@"
fi 