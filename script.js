class EnglishDiary {
    constructor() {
        this.entries = this.loadEntries();
        this.currentMode = 'japanese';
        this.currentTranslation = null;
        this.initializeElements();
        this.bindEvents();
        this.renderEntries();
    }

    initializeElements() {
        this.diaryInput1 = document.getElementById('diaryInput1');
        this.diaryInput2 = document.getElementById('diaryInput2');
        this.diaryInput3 = document.getElementById('diaryInput3');
        this.japaneseInput1 = document.getElementById('japaneseInput1');
        this.japaneseInput2 = document.getElementById('japaneseInput2');
        this.japaneseInput3 = document.getElementById('japaneseInput3');
        this.addButton = document.getElementById('addEntry');
        this.translateButton = document.getElementById('translateBtn');
        this.entriesList = document.getElementById('entriesList');
        
        this.japaneseBtn = document.getElementById('japaneseBtn');
        this.englishBtn = document.getElementById('englishBtn');
        this.japaneseSection = document.getElementById('japaneseSection');
        this.englishSection = document.getElementById('englishSection');
        
        this.translationPreview = document.getElementById('translationPreview');
        this.translatedText = document.getElementById('translatedText');
        this.confirmBtn = document.getElementById('confirmTranslation');
        this.editBtn = document.getElementById('editTranslation');
        this.cancelBtn = document.getElementById('cancelTranslation');
    }

    bindEvents() {
        this.addButton.addEventListener('click', () => this.addEntry());
        this.translateButton.addEventListener('click', () => this.translateAndPreview());
        
        [this.diaryInput1, this.diaryInput2, this.diaryInput3].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addEntry();
                }
            });
        });
        
        [this.japaneseInput1, this.japaneseInput2, this.japaneseInput3].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.translateAndPreview();
                }
            });
        });
        
        this.japaneseBtn.addEventListener('click', () => this.switchMode('japanese'));
        this.englishBtn.addEventListener('click', () => this.switchMode('english'));
        
        this.confirmBtn.addEventListener('click', () => this.confirmTranslation());
        this.editBtn.addEventListener('click', () => this.editTranslation());
        this.cancelBtn.addEventListener('click', () => this.cancelTranslation());
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.hideTranslationPreview();
        
        if (mode === 'japanese') {
            this.japaneseBtn.classList.add('active');
            this.englishBtn.classList.remove('active');
            this.japaneseSection.classList.remove('hidden');
            this.englishSection.classList.add('hidden');
        } else {
            this.englishBtn.classList.add('active');
            this.japaneseBtn.classList.remove('active');
            this.englishSection.classList.remove('hidden');
            this.japaneseSection.classList.add('hidden');
        }
    }

    async translateAndPreview() {
        const japaneseText1 = this.japaneseInput1.value.trim();
        const japaneseText2 = this.japaneseInput2.value.trim();
        const japaneseText3 = this.japaneseInput3.value.trim();
        
        if (!japaneseText1 || !japaneseText2 || !japaneseText3) {
            this.showMessage('すべての欄に日本語を入力してください！');
            return;
        }

        if (japaneseText1.length < 2 || japaneseText2.length < 2 || japaneseText3.length < 2) {
            this.showMessage('各欄に2文字以上入力してください！');
            return;
        }
        
        const japaneseText = `${japaneseText1}\n${japaneseText2}\n${japaneseText3}`;

        this.showMessage('翻訳中...', 'info');
        
        try {
            const translatedText1 = await this.translateText(japaneseText1);
            const translatedText2 = await this.translateText(japaneseText2);
            const translatedText3 = await this.translateText(japaneseText3);
            
            this.currentTranslation = {
                japanese: japaneseText,
                english: `${translatedText1}\n${translatedText2}\n${translatedText3}`,
                japanese1: japaneseText1,
                japanese2: japaneseText2, 
                japanese3: japaneseText3,
                english1: translatedText1,
                english2: translatedText2,
                english3: translatedText3
            };
            
            this.translatedText.innerHTML = `<div>${translatedText1}</div><div>${translatedText2}</div><div>${translatedText3}</div>`;
            this.showTranslationPreview();
            this.showMessage('翻訳完了！', 'success');
        } catch (error) {
            console.error('Translation error:', error);
            this.showMessage('翻訳に失敗しました。もう一度お試しください。');
        }
    }

    async translateText(text) {
        const apiUrl = 'https://api.mymemory.translated.net/get';
        const params = new URLSearchParams({
            q: text,
            langpair: 'ja|en',
            de: 'user@example.com'
        });

        try {
            const response = await fetch(`${apiUrl}?${params}`);
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData) {
                return data.responseData.translatedText;
            } else {
                throw new Error('Translation API error');
            }
        } catch (error) {
            return this.fallbackTranslation(text);
        }
    }

    fallbackTranslation(text) {
        const basicTranslations = {
            '今日は': 'Today',
            '今日': 'Today',
            'いい天気': 'nice weather',
            '晴れ': 'sunny',
            '雨': 'rainy',
            '仕事': 'work',
            '学校': 'school',
            '友達': 'friend',
            '家族': 'family',
            '楽しい': 'fun',
            '嬉しい': 'happy',
            '悲しい': 'sad',
            '疲れた': 'tired',
            '美味しい': 'delicious',
            'ありがとう': 'thank you'
        };

        let result = text;
        for (const [japanese, english] of Object.entries(basicTranslations)) {
            result = result.replace(new RegExp(japanese, 'g'), english);
        }
        
        return result !== text ? result : `Today I ${text.toLowerCase()}`;
    }

    showTranslationPreview() {
        this.translationPreview.classList.remove('hidden');
    }

    hideTranslationPreview() {
        this.translationPreview.classList.add('hidden');
    }

    confirmTranslation() {
        if (this.currentTranslation) {
            this.addEntryWithTranslation(this.currentTranslation);
            this.japaneseInput1.value = '';
            this.japaneseInput2.value = '';
            this.japaneseInput3.value = '';
            this.hideTranslationPreview();
            this.currentTranslation = null;
        }
    }

    editTranslation() {
        if (this.currentTranslation) {
            const newTranslation = prompt('英語の翻訳を編集してください:', this.currentTranslation.english);
            if (newTranslation !== null && newTranslation.trim()) {
                this.currentTranslation.english = newTranslation.trim();
                this.translatedText.textContent = this.currentTranslation.english;
            }
        }
    }

    cancelTranslation() {
        this.hideTranslationPreview();
        this.currentTranslation = null;
    }

    addEntry() {
        const text1 = this.diaryInput1.value.trim();
        const text2 = this.diaryInput2.value.trim();
        const text3 = this.diaryInput3.value.trim();
        
        if (!text1 || !text2 || !text3) {
            this.showMessage('Please fill in all three fields!');
            return;
        }

        if (text1.length < 3 || text2.length < 3 || text3.length < 3) {
            this.showMessage('Please write at least 3 characters in each field!');
            return;
        }
        
        const text = `${text1}\n${text2}\n${text3}`;

        const entry = {
            id: Date.now(),
            english: text,
            english1: text1,
            english2: text2,
            english3: text3,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        this.entries.unshift(entry);
        this.saveEntries();
        this.renderEntries();
        this.diaryInput1.value = '';
        this.diaryInput2.value = '';
        this.diaryInput3.value = '';
        this.showMessage('Entry added!', 'success');
    }

    addEntryWithTranslation(translation) {
        const entry = {
            id: Date.now(),
            japanese: translation.japanese,
            english: translation.english,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        this.entries.unshift(entry);
        this.saveEntries();
        this.renderEntries();
        this.showMessage('日記が追加されました！', 'success');
    }

    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== id);
            this.saveEntries();
            this.renderEntries();
            this.showMessage('Entry deleted!', 'success');
        }
    }

    renderEntries() {
        if (this.entries.length === 0) {
            this.entriesList.innerHTML = `
                <div class="no-entries">
                    <p>まだエントリーがありません。最初の3つの良いことを書いてみましょう！</p>
                </div>
            `;
            return;
        }

        this.entriesList.innerHTML = this.entries
            .map(entry => `
                <div class="diary-entry">
                    <button class="delete-btn" onclick="diary.deleteEntry(${entry.id})">×</button>
                    <div class="entry-date">${entry.date}</div>
                    ${entry.japanese1 && entry.japanese2 && entry.japanese3 ? `
                        <div class="three-things">
                            <div class="thing-item">
                                <div class="entry-japanese">${this.escapeHtml(entry.japanese1)}</div>
                                <div class="entry-english">${this.escapeHtml(entry.english1)}</div>
                            </div>
                            <div class="thing-item">
                                <div class="entry-japanese">${this.escapeHtml(entry.japanese2)}</div>
                                <div class="entry-english">${this.escapeHtml(entry.english2)}</div>
                            </div>
                            <div class="thing-item">
                                <div class="entry-japanese">${this.escapeHtml(entry.japanese3)}</div>
                                <div class="entry-english">${this.escapeHtml(entry.english3)}</div>
                            </div>
                        </div>
                    ` : entry.english1 && entry.english2 && entry.english3 ? `
                        <div class="three-things">
                            <div class="thing-item">
                                <div class="entry-english-only">${this.escapeHtml(entry.english1)}</div>
                            </div>
                            <div class="thing-item">
                                <div class="entry-english-only">${this.escapeHtml(entry.english2)}</div>
                            </div>
                            <div class="thing-item">
                                <div class="entry-english-only">${this.escapeHtml(entry.english3)}</div>
                            </div>
                        </div>
                    ` : entry.japanese ? `
                        <div class="entry-japanese">${this.escapeHtml(entry.japanese)}</div>
                        <div class="entry-english">${this.escapeHtml(entry.english)}</div>
                    ` : `
                        <div class="entry-text">${this.escapeHtml(entry.english || entry.text)}</div>
                    `}
                </div>
            `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transition: opacity 0.3s ease;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
        `;
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 2000);
    }

    loadEntries() {
        try {
            const stored = localStorage.getItem('englishDiaryEntries');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading entries:', error);
            return [];
        }
    }

    saveEntries() {
        try {
            localStorage.setItem('englishDiaryEntries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error saving entries:', error);
            this.showMessage('Error saving entry!');
        }
    }
}

const diary = new EnglishDiary();