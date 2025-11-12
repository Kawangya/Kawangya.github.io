document.addEventListener('DOMContentLoaded', function() {
    // 配置
    const CONFIG = {
        copyAlertDuration: {
            success: 2000,
            error: 3000
        }
    };
    
    // 缓存DOM元素
    const copyAlert = document.getElementById('copyAlert');
    
    try {
        // 复制按钮功能
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', handleCopyClick);
        });

        // 图片放大功能
        const images = document.querySelectorAll('img:not(.copy-btn *)');
        images.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', handleImageClick);
        });
    } catch (error) {
        console.error('功能初始化失败:', error);
    }

    function handleCopyClick() {
        if (this.disabled) return;
        
        const preElement = this.closest('pre');
        const codeElement = preElement?.querySelector('code');
        
        if (!codeElement) {
            showCopyError('未找到代码内容');
            return;
        }

        this.disabled = true;
        const textToCopy = codeElement.textContent || codeElement.innerText;
        
        copyToClipboard(textToCopy).finally(() => {
            setTimeout(() => {
                this.disabled = false;
            }, 1000);
        });
    }

    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                showCopySuccess();
                return true;
            } else {
                return fallbackCopyText(text);
            }
        } catch (err) {
            console.error('复制失败: ', err);
            return fallbackCopyText(text);
        }
    }

    function fallbackCopyText(text) {
        return new Promise((resolve) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            Object.assign(textArea.style, {
                position: "fixed",
                opacity: "0",
                pointerEvents: "none"
            });
            
            document.body.appendChild(textArea);
            textArea.select();
            textArea.setSelectionRange(0, 99999); // 移动端支持
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    showCopySuccess();
                    resolve(true);
                } else {
                    showCopyError('复制失败');
                    resolve(false);
                }
            } catch (err) {
                document.body.removeChild(textArea);
                console.error('复制失败: ', err);
                showCopyError('复制失败，请手动选择文本复制');
                resolve(false);
            }
        });
    }

    function showCopySuccess() {
        showAlert("复制成功!", "copy-success", CONFIG.copyAlertDuration.success);
    }

    function showCopyError(message = "复制失败，请手动选择文本复制") {
        showAlert(message, "copy-error", CONFIG.copyAlertDuration.error);
    }

    function showAlert(message, className, duration) {
        if (!copyAlert) {
            console.warn('复制提示元素未找到');
            return;
        }
        
        if (copyAlert._timeoutId) {
            clearTimeout(copyAlert._timeoutId);
        }
        
        copyAlert.textContent = message;
        copyAlert.className = `copy-alert ${className}`;
        copyAlert.style.display = 'block';
        
        copyAlert._timeoutId = setTimeout(() => {
            copyAlert.style.display = 'none';
            copyAlert._timeoutId = null;
        }, duration);
    }

    function handleImageClick(e) {
        e.stopPropagation();
        
        if (document.querySelector('.image-overlay')) return;
        
        const overlay = document.createElement('div');
        const clonedImg = this.cloneNode();
        
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });
        
        overlay.className = 'image-overlay';
        
        Object.assign(clonedImg.style, {
            maxWidth: '95%',
            maxHeight: '95%',
            objectFit: 'contain',
            transform: 'scale(0.9)',
            transition: 'transform 0.3s ease',
            borderRadius: '4px'
        });
        
        overlay.appendChild(clonedImg);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            clonedImg.style.transform = 'scale(1)';
        }, 10);
        
        const removeOverlay = () => {
            overlay.style.opacity = '0';
            clonedImg.style.transform = 'scale(0.9)';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                document.body.style.overflow = '';
            }, 300);
        };
        
        const handleKeydown = (e) => {
            if (e.key === 'Escape') removeOverlay();
        };
        
        overlay.addEventListener('click', removeOverlay);
        document.addEventListener('keydown', handleKeydown);
        
        // 使用一次性事件监听器
        overlay.addEventListener('click', function cleanup() {
            document.removeEventListener('keydown', handleKeydown);
            overlay.removeEventListener('click', cleanup);
        }, { once: true });
    }
});