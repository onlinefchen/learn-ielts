// Progress management using GitHub Gist
class ProgressManager {
    constructor() {
        this.gistId = null;
        this.token = null;
        this.localProgress = JSON.parse(localStorage.getItem('masteredWords') || '{}');
        this.init();
    }

    init() {
        // Try to get token and gist ID from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        this.token = urlParams.get('token') || localStorage.getItem('github_token');
        this.gistId = urlParams.get('gist') || localStorage.getItem('gist_id');
        
        if (this.token && this.gistId) {
            this.loadFromGist();
        }
    }

    async createGist() {
        if (!this.token) {
            alert('请先设置 GitHub Token');
            return;
        }

        try {
            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: 'IELTS Vocabulary Learning Progress',
                    public: false,
                    files: {
                        'progress.json': {
                            content: JSON.stringify({
                                masteredWords: this.localProgress,
                                lastUpdated: new Date().toISOString(),
                                version: '1.0.0'
                            }, null, 2)
                        }
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.gistId = data.id;
                localStorage.setItem('gist_id', this.gistId);
                this.showSyncStatus('✅ 已创建云端存储');
                return data;
            } else {
                throw new Error('Failed to create gist');
            }
        } catch (error) {
            console.error('Error creating gist:', error);
            this.showSyncStatus('❌ 创建云端存储失败');
        }
    }

    async loadFromGist() {
        if (!this.gistId) return;

        try {
            const headers = {
                'Accept': 'application/vnd.github.v3+json'
            };
            
            if (this.token) {
                headers['Authorization'] = `token ${this.token}`;
            }

            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                headers: headers
            });

            if (response.ok) {
                const data = await response.json();
                const content = JSON.parse(data.files['progress.json'].content);
                this.localProgress = content.masteredWords || {};
                localStorage.setItem('masteredWords', JSON.stringify(this.localProgress));
                this.showSyncStatus('✅ 已从云端同步');
                
                // Trigger UI update
                if (window.updateUIFromProgress) {
                    window.updateUIFromProgress();
                }
            } else {
                throw new Error('Failed to load gist');
            }
        } catch (error) {
            console.error('Error loading from gist:', error);
            this.showSyncStatus('❌ 云端同步失败');
        }
    }

    async saveToGist(masteredWords) {
        this.localProgress = masteredWords;
        localStorage.setItem('masteredWords', JSON.stringify(masteredWords));

        if (!this.gistId || !this.token) {
            return;
        }

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        'progress.json': {
                            content: JSON.stringify({
                                masteredWords: masteredWords,
                                lastUpdated: new Date().toISOString(),
                                version: '1.0.0'
                            }, null, 2)
                        }
                    }
                })
            });

            if (response.ok) {
                this.showSyncStatus('✅ 已保存到云端');
            } else {
                throw new Error('Failed to save to gist');
            }
        } catch (error) {
            console.error('Error saving to gist:', error);
            this.showSyncStatus('❌ 云端保存失败');
        }
    }

    showSyncStatus(message) {
        // Remove existing status
        const existingStatus = document.querySelector('.sync-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create and show new status
        const status = document.createElement('div');
        status.className = 'sync-status';
        status.textContent = message;
        status.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
        `;
        document.body.appendChild(status);

        setTimeout(() => status.remove(), 3000);
    }

    setupUI() {
        // Add sync controls to the page
        const syncControl = document.createElement('div');
        syncControl.className = 'sync-control';
        syncControl.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `;

        if (!this.token || !this.gistId) {
            syncControl.innerHTML = `
                <h4 style="margin: 0 0 10px 0;">云端同步设置</h4>
                <input type="password" id="github-token" placeholder="GitHub Token" style="width: 200px; padding: 5px; margin-bottom: 10px;">
                <br>
                <input type="text" id="gist-id" placeholder="Gist ID (可选)" style="width: 200px; padding: 5px; margin-bottom: 10px;">
                <br>
                <button onclick="progressManager.setupSync()" style="padding: 5px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    启用云端同步
                </button>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    <a href="https://github.com/settings/tokens/new?scopes=gist" target="_blank">获取 Token →</a>
                </div>
            `;
        } else {
            syncControl.innerHTML = `
                <h4 style="margin: 0 0 10px 0;">云端同步</h4>
                <p style="margin: 5px 0; font-size: 14px;">✅ 已启用</p>
                <button onclick="progressManager.loadFromGist()" style="padding: 5px 10px; margin-right: 5px;">同步下载</button>
                <button onclick="progressManager.saveToGist(masteredWords)" style="padding: 5px 10px;">同步上传</button>
                <br>
                <button onclick="progressManager.disableSync()" style="padding: 5px 10px; margin-top: 5px; font-size: 12px;">停用</button>
            `;
        }

        document.body.appendChild(syncControl);
    }

    async setupSync() {
        const tokenInput = document.getElementById('github-token');
        const gistInput = document.getElementById('gist-id');
        
        this.token = tokenInput.value.trim();
        this.gistId = gistInput.value.trim();

        if (!this.token) {
            alert('请输入 GitHub Token');
            return;
        }

        localStorage.setItem('github_token', this.token);
        
        if (this.gistId) {
            localStorage.setItem('gist_id', this.gistId);
            await this.loadFromGist();
        } else {
            await this.createGist();
        }

        // Refresh UI
        location.reload();
    }

    disableSync() {
        localStorage.removeItem('github_token');
        localStorage.removeItem('gist_id');
        this.token = null;
        this.gistId = null;
        location.reload();
    }
}

// Create global instance
window.progressManager = new ProgressManager();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);