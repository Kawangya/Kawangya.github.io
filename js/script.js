document.addEventListener('DOMContentLoaded', function () {
    // 配置
    const CONFIG = {
        copyAlertDuration: {
            success: 2000,
            error: 3000
        },
        imageOverlay: {
            closeDelay: 300
        }
    };

    // 缓存DOM元素
    const copyAlert = document.getElementById('copyAlert');
    let currentImageOverlay = null;

    try {
        // 复制按钮功能
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', handleCopyClick);
        });

        document.querySelectorAll('summary').forEach(summary => {
            summary.addEventListener('mousedown', clearTextSelection);
            summary.addEventListener('mouseup', clearTextSelection);
            summary.addEventListener('selectstart', preventSelectionStart);
        });

        // 图片放大功能：使用事件委托，兼容后续动态渲染的图片
        document.addEventListener('click', handleImageClick, true);
    } catch (error) {
        console.error('功能初始化失败:', error);
    }

    function handleCopyClick() {
        if (this.disabled) return;

        const codeWrapper = this.closest('.code-wrapper');
        const codeElement = codeWrapper?.querySelector('code');

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

    function clearTextSelection() {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            selection.removeAllRanges();
        }
    }

    function preventSelectionStart(event) {
        event.preventDefault();
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
        const image = e.target.closest('img');

        if (!image || image.closest('.image-overlay')) {
            return;
        }

        if (currentImageOverlay) {
            return;
        }

        e.preventDefault();

        const overlay = document.createElement('div');
        const clonedImg = image.cloneNode(true);
        const originalBodyOverflow = document.body.style.overflow;
        const originalBodyPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        overlay.className = 'image-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        if (scrollbarWidth > 0) {
            const currentPaddingRight = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
            document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        }

        document.body.style.overflow = 'hidden';

        clonedImg.alt = image.alt || '';
        clonedImg.loading = 'eager';
        clonedImg.decoding = 'async';
        clonedImg.style.cursor = 'zoom-out';

        overlay.appendChild(clonedImg);
        document.body.appendChild(overlay);
        currentImageOverlay = overlay;

        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        const closeOverlay = () => {
            if (!currentImageOverlay) {
                return;
            }

            overlay.classList.remove('active');
            window.setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }

                document.body.style.overflow = originalBodyOverflow;
                document.body.style.paddingRight = originalBodyPaddingRight;
                currentImageOverlay = null;
                document.removeEventListener('keydown', handleKeydown);
            }, CONFIG.imageOverlay.closeDelay);
        };

        const handleKeydown = (keyEvent) => {
            if (keyEvent.key === 'Escape') {
                closeOverlay();
            }
        };

        overlay.addEventListener('click', closeOverlay);
        document.addEventListener('keydown', handleKeydown);
    }
});