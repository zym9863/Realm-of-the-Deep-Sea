/**
 * visual-effects.js - 视觉效果管理器
 * 处理气泡、粒子、扫描等动态视觉效果
 */

class VisualEffectsManager {
    constructor() {
        this.bubblesContainer = document.getElementById('bubbles-container');
        this.particlesContainer = document.getElementById('particles-container');
        this.scanEffect = document.getElementById('scan-effect');
        this.warningSystem = document.getElementById('warning-system');
        
        this.bubbles = [];
        this.particles = [];
        this.maxBubbles = 20;
        this.maxParticles = 30;
        
        this.init();
    }
    
    /**
     * 初始化视觉效果
     */
    init() {
        this.createBubbles();
        this.createParticles();
        this.startAnimationLoop();
        this.setupEventListeners();
    }
    
    /**
     * 创建气泡效果
     */
    createBubbles() {
        for (let i = 0; i < this.maxBubbles; i++) {
            setTimeout(() => {
                this.createBubble();
            }, i * 500);
        }
    }
    
    /**
     * 创建单个气泡
     */
    createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 随机大小
        const size = Math.random() * 15 + 5;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // 随机水平位置
        bubble.style.left = `${Math.random() * 100}%`;
        
        // 随机动画持续时间
        const duration = Math.random() * 10 + 8;
        bubble.style.animationDuration = `${duration}s`;
        
        // 随机动画延迟
        const delay = Math.random() * 5;
        bubble.style.animationDelay = `${delay}s`;
        
        // 随机摇摆幅度
        const swayAmount = Math.random() * 100 - 50;
        bubble.style.setProperty('--sway-amount', `${swayAmount}px`);
        
        this.bubblesContainer.appendChild(bubble);
        this.bubbles.push(bubble);
        
        // 动画结束后重新创建
        bubble.addEventListener('animationend', () => {
            bubble.remove();
            const index = this.bubbles.indexOf(bubble);
            if (index > -1) {
                this.bubbles.splice(index, 1);
            }
            this.createBubble();
        });
    }
    
    /**
     * 创建粒子效果
     */
    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 300);
        }
    }
    
    /**
     * 创建单个粒子
     */
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机位置
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // 随机大小
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // 随机动画持续时间
        const duration = Math.random() * 15 + 10;
        particle.style.animationDuration = `${duration}s`;
        
        // 随机动画延迟
        const delay = Math.random() * 10;
        particle.style.animationDelay = `${delay}s`;
        
        // 随机透明度
        particle.style.opacity = Math.random() * 0.6 + 0.2;
        
        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
        
        // 动画结束后重新创建
        particle.addEventListener('animationend', () => {
            particle.remove();
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
            this.createParticle();
        });
    }
    
    /**
     * 触发扫描效果
     */
    triggerScan() {
        this.scanEffect.classList.add('active');
        setTimeout(() => {
            this.scanEffect.classList.remove('active');
        }, 2000);
    }
    
    /**
     * 显示警告
     * @param {string} message - 警告消息
     * @param {number} duration - 显示持续时间（毫秒）
     */
    showWarning(message, duration = 3000) {
        const warningText = this.warningSystem.querySelector('.warning-text');
        warningText.textContent = message;
        this.warningSystem.classList.add('active');
        
        setTimeout(() => {
            this.warningSystem.classList.remove('active');
        }, duration);
    }
    
    /**
     * 创建爆炸粒子效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createExplosion(x, y) {
        const explosionContainer = document.createElement('div');
        explosionContainer.style.position = 'fixed';
        explosionContainer.style.left = `${x}px`;
        explosionContainer.style.top = `${y}px`;
        explosionContainer.style.pointerEvents = 'none';
        explosionContainer.style.zIndex = '1000';
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = '#00e5ff';
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = '0 0 6px #00e5ff';
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = Math.random() * 100 + 50;
            const lifetime = Math.random() * 1000 + 500;
            
            particle.style.animation = `explosion-particle ${lifetime}ms ease-out forwards`;
            particle.style.setProperty('--dx', `${Math.cos(angle) * velocity}px`);
            particle.style.setProperty('--dy', `${Math.sin(angle) * velocity}px`);
            
            explosionContainer.appendChild(particle);
        }
        
        document.body.appendChild(explosionContainer);
        
        setTimeout(() => {
            explosionContainer.remove();
        }, 2000);
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 按S键触发扫描
        document.addEventListener('keydown', (e) => {
            if (e.key === 's' || e.key === 'S') {
                if (!e.ctrlKey) { // 避免与保存快捷键冲突
                    this.triggerScan();
                }
            }
        });
        
        // 点击创建爆炸效果（可选）
        document.addEventListener('click', (e) => {
            if (e.target.id === 'scene-container') {
                this.createExplosion(e.clientX, e.clientY);
            }
        });
    }
    
    /**
     * 开始动画循环
     */
    startAnimationLoop() {
        const animate = () => {
            // 更新迷你地图雷达效果
            this.updateRadar();
            
            // 更新速度计
            this.updateSpeedometer();
            
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    /**
     * 更新雷达效果
     */
    updateRadar() {
        const canvas = document.getElementById('minimap-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // 绘制雷达网格
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.lineWidth = 1;
        
        // 绘制同心圆
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 5;
        
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (maxRadius / 3) * i, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 绘制十字线
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();
        
        // 添加随机信号点
        if (Math.random() > 0.95) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * maxRadius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            ctx.fillStyle = 'rgba(255, 193, 7, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * 更新速度计
     */
    updateSpeedometer() {
        const speedValue = document.querySelector('.speed-value');
        const speedNeedle = document.querySelector('.speed-needle');
        
        if (speedValue && speedNeedle) {
            // 模拟速度变化
            const currentSpeed = parseFloat(speedValue.textContent) || 0;
            const targetSpeed = Math.random() * 5;
            const newSpeed = currentSpeed + (targetSpeed - currentSpeed) * 0.1;
            
            speedValue.textContent = newSpeed.toFixed(1);
            
            // 更新指针角度
            const angle = -90 + (newSpeed / 10) * 180;
            speedNeedle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 清理气泡
        this.bubbles.forEach(bubble => bubble.remove());
        this.bubbles = [];
        
        // 清理粒子
        this.particles.forEach(particle => particle.remove());
        this.particles = [];
    }
}

// 添加爆炸粒子动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes explosion-particle {
        0% {
            transform: translate(0, 0);
            opacity: 1;
        }
        100% {
            transform: translate(var(--dx), var(--dy));
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 导出供主文件使用
export default VisualEffectsManager;
