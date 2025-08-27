class SleepPreventionTimer {
    constructor() {
        this.alarmTime = null;
        this.isAlarmSet = false;
        this.isAlarmRinging = false;
        this.snoozeCount = 0;
        this.maxSnoozeCount = 3;
        this.currentWordQuiz = null;
        this.wordQuizData = [
            { question: "What is the English word for '犬'?", answers: ["dog"] },
            { question: "What is the English word for '猫'?", answers: ["cat"] },
            { question: "What is the English word for '鳥'?", answers: ["bird"] },
            { question: "What is the English word for '魚'?", answers: ["fish"] },
            { question: "What is the English word for '家'?", answers: ["house", "home"] },
            { question: "What is the English word for '車'?", answers: ["car"] },
            { question: "What is the English word for '本'?", answers: ["book"] },
            { question: "What is the English word for '水'?", answers: ["water"] },
            { question: "What is the English word for '食べ物'?", answers: ["food"] },
            { question: "What is the English word for '学校'?", answers: ["school"] },
            { question: "What is the English word for '友達'?", answers: ["friend"] },
            { question: "What is the English word for '時間'?", answers: ["time"] },
            { question: "What is the English word for '音楽'?", answers: ["music"] },
            { question: "What is the English word for '映画'?", answers: ["movie", "film"] },
            { question: "What is the English word for '花'?", answers: ["flower"] }
        ];
        this.alarmInterval = null;
        this.clockInterval = null;
        
        this.initializeElements();
        this.bindEvents();
        this.startClock();
        
        // ページ離脱を防ぐ
        window.addEventListener('beforeunload', (e) => {
            if (this.isAlarmSet) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    initializeElements() {
        this.elements = {
            alarmTime: document.getElementById('alarm-time'),
            snoozeButtons: document.querySelectorAll('.snooze-btn'),
            setAlarmBtn: document.getElementById('set-alarm'),
            cancelAlarmBtn: document.getElementById('cancel-alarm'),
            currentTime: document.getElementById('current-time'),
            alarmStatus: document.getElementById('alarm-status'),
            countdown: document.getElementById('countdown'),
            alarmPanel: document.getElementById('alarm-panel'),
            wordQuestion: document.getElementById('word-question'),
            wordAnswer: document.getElementById('word-answer'),
            solveWordBtn: document.getElementById('solve-word'),
            snoozeBtn: document.getElementById('snooze-btn'),
            stopAlarmBtn: document.getElementById('stop-alarm'),
            alarmSound: document.getElementById('alarm-sound')
        };
    }

    bindEvents() {
        this.elements.setAlarmBtn.addEventListener('click', () => this.setAlarm());
        this.elements.cancelAlarmBtn.addEventListener('click', () => this.cancelAlarm());
        this.elements.solveWordBtn.addEventListener('click', () => this.checkWordAnswer());
        this.elements.snoozeBtn.addEventListener('click', () => this.snoozeAlarm());
        this.elements.stopAlarmBtn.addEventListener('click', () => this.stopAlarm());
        
        // スヌーズボタンのイベントリスナー
        this.elements.snoozeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectSnoozeCount(btn));
        });
        
        this.elements.wordAnswer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkWordAnswer();
            }
        });
    }

    startClock() {
        this.updateClock();
        this.clockInterval = setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ja-JP');
        this.elements.currentTime.textContent = timeString;

        if (this.isAlarmSet && this.alarmTime) {
            const timeDiff = this.alarmTime - now;
            
            if (timeDiff <= 0 && !this.isAlarmRinging) {
                this.triggerAlarm();
            } else if (timeDiff > 0) {
                this.updateCountdown(timeDiff);
            }
        }
    }

    updateCountdown(timeDiff) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        const countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.elements.countdown.textContent = `Time left: ${countdown}`;
    }

    setAlarm() {
        const timeValue = this.elements.alarmTime.value;
        if (!timeValue) {
            alert('Please set the time');
            return;
        }

        const now = new Date();
        this.alarmTime = new Date();
        const [hours, minutes] = timeValue.split(':');
        this.alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // 翌日の場合
        if (this.alarmTime <= now) {
            this.alarmTime.setDate(this.alarmTime.getDate() + 1);
        }

        this.maxSnoozeCount = parseInt(document.querySelector('.snooze-btn.active').dataset.count);
        this.snoozeCount = 0;
        this.isAlarmSet = true;
        
        this.elements.setAlarmBtn.style.display = 'none';
        this.elements.cancelAlarmBtn.style.display = 'block';
        this.elements.alarmStatus.textContent = `Alarm set: ${timeValue}`;
        this.elements.alarmStatus.style.color = '#28a745';

        // 通知の許可を求める
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    cancelAlarm() {
        this.isAlarmSet = false;
        this.isAlarmRinging = false;
        this.alarmTime = null;
        this.snoozeCount = 0;
        
        this.elements.setAlarmBtn.style.display = 'block';
        this.elements.cancelAlarmBtn.style.display = 'none';
        this.elements.alarmStatus.textContent = 'No alarm set';
        this.elements.alarmStatus.style.color = '#666';
        this.elements.countdown.textContent = '--:--:--';
        this.elements.alarmPanel.style.display = 'none';
        
        this.elements.alarmSound.pause();
        this.elements.alarmSound.currentTime = 0;
    }

    triggerAlarm() {
        this.isAlarmRinging = true;
        this.elements.alarmPanel.style.display = 'block';
        this.elements.alarmSound.play().catch(e => {
            console.log('Audio playback failed:', e);
        });
        
        this.generateWordQuiz();
        this.elements.wordAnswer.focus();

        // ブラウザ通知
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Time to wake up!', {
                body: 'Nap Timer is now active'
            });
        }

        // スヌーズボタンの表示制御
        if (this.snoozeCount >= this.maxSnoozeCount) {
            this.elements.snoozeBtn.style.display = 'none';
        } else {
            this.elements.snoozeBtn.style.display = 'block';
            this.elements.snoozeBtn.textContent = `Snooze (${this.snoozeCount + 1}/${this.maxSnoozeCount})`;
        }
    }

    generateWordQuiz() {
        const randomIndex = Math.floor(Math.random() * this.wordQuizData.length);
        this.currentWordQuiz = this.wordQuizData[randomIndex];
        
        this.elements.wordQuestion.textContent = this.currentWordQuiz.question;
        this.elements.wordAnswer.value = '';
    }

    checkWordAnswer() {
        const userAnswer = this.elements.wordAnswer.value.toLowerCase().trim();
        
        if (this.currentWordQuiz.answers.some(answer => answer.toLowerCase() === userAnswer)) {
            this.stopAlarm();
            alert('Correct! Good job!');
        } else {
            alert('Incorrect. Try again with a different word.');
            this.elements.wordAnswer.value = '';
            this.elements.wordAnswer.focus();
            this.generateWordQuiz();
        }
    }

    snoozeAlarm() {
        if (this.snoozeCount >= this.maxSnoozeCount) {
            alert('Maximum snooze count reached');
            return;
        }

        this.snoozeCount++;
        this.isAlarmRinging = false;
        this.elements.alarmPanel.style.display = 'none';
        this.elements.alarmSound.pause();
        this.elements.alarmSound.currentTime = 0;

        // Alarm again after 5 minutes
        this.alarmTime = new Date(Date.now() + 5 * 60 * 1000);
        this.elements.alarmStatus.textContent = `Snoozing (${this.snoozeCount}/${this.maxSnoozeCount})`;
        this.elements.alarmStatus.style.color = '#ffc107';
    }

    stopAlarm() {
        this.isAlarmRinging = false;
        this.isAlarmSet = false;
        this.elements.alarmPanel.style.display = 'none';
        this.elements.alarmSound.pause();
        this.elements.alarmSound.currentTime = 0;
        
        this.elements.setAlarmBtn.style.display = 'block';
        this.elements.cancelAlarmBtn.style.display = 'none';
        this.elements.alarmStatus.textContent = 'Alarm stopped';
        this.elements.alarmStatus.style.color = '#28a745';
        this.elements.countdown.textContent = '--:--:--';
        
        setTimeout(() => {
            this.elements.alarmStatus.textContent = 'No alarm set';
            this.elements.alarmStatus.style.color = '#666';
        }, 3000);
    }

    selectSnoozeCount(selectedBtn) {
        // すべてのボタンからactiveクラスを削除
        this.elements.snoozeButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // クリックされたボタンにactiveクラスを追加
        selectedBtn.classList.add('active');
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    new SleepPreventionTimer();
});

// PWA対応（サービスワーカー）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}