// 优化后的代码
document.addEventListener('DOMContentLoaded', function() {
    // 缓存DOM元素
    const copyAlert = document.getElementById('copyAlert');
    
    // 复制按钮功能
    const copyButtons = document.querySelectorAll('.copy-btn');
    if (copyButtons.length > 0) {
        copyButtons.forEach(button => {
            button.addEventListener('click', handleCopyClick);
        });
    }

    // 图片放大功能
    const images = document.querySelectorAll('img');
    if (images.length > 0) {
        images.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', handleImageClick);
        });
    }

    function handleCopyClick() {
        const preElement = this.closest('pre');
        const codeElement = preElement?.querySelector('code');
        
        if (!codeElement) {
            showCopyError('未找到代码内容');
            return;
        }

        const textToCopy = codeElement.textContent;
        copyToClipboard(textToCopy);
    }

    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                showCopySuccess();
            } else {
                fallbackCopyText(text);
            }
        } catch (err) {
            console.error('复制失败: ', err);
            fallbackCopyText(text);
        }
    }

    function fallbackCopyText(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        Object.assign(textArea.style, {
            position: "fixed",
            opacity: "0",
            pointerEvents: "none"
        });
        
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                showCopyError('复制失败');
            }
        } catch (err) {
            console.error('复制失败: ', err);
            showCopyError('复制失败，请手动选择文本复制');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    function showCopySuccess() {
        showAlert("复制成功!", "copy-success", 2000);
    }

    function showCopyError(message = "复制失败，请手动选择文本复制") {
        showAlert(message, "copy-error", 3000);
    }

    function showAlert(message, className, duration) {
        if (!copyAlert) return;
        
        copyAlert.textContent = message;
        copyAlert.className = `copy-alert ${className}`;
        copyAlert.style.display = 'block';
        
        setTimeout(() => {
            copyAlert.style.display = 'none';
        }, duration);
    }

    function handleImageClick() {
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
            zIndex: '9999'
        });
        
        Object.assign(clonedImg.style, {
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain'
        });
        
        overlay.appendChild(clonedImg);
        document.body.appendChild(overlay);
        
        const removeOverlay = () => overlay.remove();
        overlay.addEventListener('click', removeOverlay);
        
        // 添加键盘支持
        const handleKeydown = (e) => {
            if (e.key === 'Escape') removeOverlay();
        };
        document.addEventListener('keydown', handleKeydown);
        
        // 清理事件监听器
        overlay.addEventListener('click', function cleanup() {
            document.removeEventListener('keydown', handleKeydown);
            overlay.removeEventListener('click', cleanup);
        });
    }
});