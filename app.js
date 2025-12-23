// Answering Guru Application
class AnsweringGuru {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.questionInput = document.getElementById('question-input');
        this.askButton = document.getElementById('ask-button');

        this.init();
    }

    init() {
        this.askButton.addEventListener('click', () => this.handleAsk());
        this.questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAsk();
            }
        });

        // Focus on input when page loads
        this.questionInput.focus();
    }

    async handleAsk() {
        const question = this.questionInput.value.trim();
        if (!question) return;

        // Add user message
        this.addMessage(question, 'user');
        this.questionInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get answer from backend (placeholder for now)
            const answer = await this.getAnswer(question);

            // Remove typing indicator and add bot response
            this.hideTypingIndicator();
            this.addMessage(answer, 'bot');
        } catch (error) {
            console.error('Error getting answer:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }

        // Scroll to bottom
        this.scrollToBottom();
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? '👤' : '🧠';

        const content = document.createElement('div');
        content.className = 'message-content';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;

        content.appendChild(textDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🧠';

        const content = document.createElement('div');
        content.className = 'message-content';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = 'Thinking... <span class="loading"></span>';

        content.appendChild(textDiv);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);

        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // Placeholder function for getting answers
    // This will be replaced with actual Tauri backend calls
    async getAnswer(question) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simple rule-based responses for demo
        const responses = {
            'hello': 'Hello! How can I help you today?',
            'hi': 'Hi there! What would you like to know?',
            'how are you': 'I\'m doing well, thank you for asking! I\'m here and ready to help you with any questions.',
            'what is': 'That\'s a great question! Let me think about it...',
            'why': 'Interesting question! The answer might be...',
            'how': 'Let me explain how that works...',
            'when': 'Timing is important! Let me tell you when...',
            'where': 'Location matters! Here\'s where you can find...',
        };

        // Check for keywords in the question
        const lowerQuestion = question.toLowerCase();
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerQuestion.includes(keyword)) {
                return response + ' (This is a placeholder response. The real answering functionality will be implemented in the Tauri backend.)';
            }
        }

        // Default response
        return `Thank you for your question: "${question}". I'm a placeholder answering system for now. The real AI-powered answering functionality will be implemented using Tauri's Rust backend with machine learning capabilities.`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnsweringGuru();
});
