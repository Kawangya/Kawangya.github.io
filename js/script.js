// 复制按钮功能实现
document.addEventListener('DOMContentLoaded', function() {
    // 为所有复制按钮添加点击事件
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 获取代码内容
            const preElement = this.closest('pre');
            const codeElement = preElement.querySelector('code');
            const textToCopy = codeElement.textContent;

            // 使用现代Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showCopySuccess();
                }).catch(err => {
                    console.error('复制失败: ', err);
                    fallbackCopyText(textToCopy);
                });
            } else {
                // 使用传统方法
                fallbackCopyText(textToCopy);
            }
        });
    });

    // 传统复制方法
    function fallbackCopyText(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                showCopyError();
            }
        } catch (err) {
            console.error('复制失败: ', err);
            showCopyError();
        }

        document.body.removeChild(textArea);
    }

    // 显示复制成功提示
    function showCopySuccess() {
        const alert = document.getElementById('copyAlert');
        alert.textContent = "复制成功!";
        alert.className = "copy-alert copy-success";
        alert.style.display = 'block';
        setTimeout(() => {
            alert.style.display = 'none';
        }, 2000);
    }

    // 显示复制失败提示
    function showCopyError() {
        const alert = document.getElementById('copyAlert');
        alert.textContent = "复制失败，请手动选择文本复制";
        alert.className = "copy-alert copy-error";
        alert.style.display = 'block';
        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    }
});

// 为所有图片添加点击放大效果
document.querySelectorAll('img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.onclick = function() {
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: zoom-out;
            z-index: 9999;
        `;
        
        // 创建图片容器，确保完美水平居中
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: auto;
            height: auto;
            max-width: 95vw;
            max-height: 95vh;
            margin: 0 auto; /* 确保水平居中 */
        `;
        
        // 克隆并放大图片
        const clonedImg = img.cloneNode();
        clonedImg.style.cssText = `
            display: block;
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            margin: 0 auto; /* 图片本身也水平居中 */
        `;
        
        imgContainer.appendChild(clonedImg);
        overlay.appendChild(imgContainer);
        document.body.appendChild(overlay);
        
        // 点击遮罩层关闭放大效果
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
        
        // 添加ESC键关闭功能
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    };
});