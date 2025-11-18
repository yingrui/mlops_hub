# 安装orbstack 
1. 链接：https://orbstack.dev/
2. 安装并等待安装完成
3. 设置启动k8s 点击turn on

# 启动依赖工具
1. 到主目录
2. cd backend
3. 执行 sh dev.sh
4. 执行 sh dev.sh port-forward

# 创建账号
1. 打开http://localhost:8081/(admin/admin) 并登录
2. 在user中创建账号并设置密码

# 启动后端工程
1. 到主目录
2. cd backend
3. 安装jdk  brew install openjdk@21
4. 安装maven  brew install mvn
5. 设置JAVA_HOME 
     vim ~/.zshrc
     添加：
     export JAVA_HOME=/opt/homebrew/opt/openjdk@21
     export PATH=$JAVA_HOME/bin:$PATH
6. 启动工程 mvn clean spring-boot:run

# 启动前段工程
1. 到主目录
2. cd frontend
3. 安装npm brew install npm
4. 启动 npm run start

# 启动推理服务
1. 到主目录
2. cd inference_server
3. 启动推理服务 sh dev.sh


