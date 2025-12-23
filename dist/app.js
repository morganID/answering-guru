(function () {
    'use strict';

    // Answering Guru - Freelancer Professional Answer Generator
    class AnsweringGuru {
        constructor() {
            this.clientMessageInput = document.getElementById('client-message-input');
            this.shortAnswerInput = document.getElementById('short-answer-input');
            this.generateButton = document.getElementById('generate-button');
            this.pasteButton = document.getElementById('paste-button');
            this.copyResultBtn = document.getElementById('copy-result-btn');
            this.resultSection = document.getElementById('result-section');
            this.resultContent = document.getElementById('result-content');
            this.historyList = document.getElementById('history-list');

            // Settings elements
            this.settingsToggle = document.getElementById('settings-toggle');
            this.settingsPanel = document.getElementById('settings-panel');
            this.apiKeyInput = document.getElementById('api-key-input');
            this.testApiKeyBtn = document.getElementById('test-api-key-btn');
            this.saveApiKeyBtn = document.getElementById('save-api-key-btn');

            // History sidebar elements
            this.historyToggle = document.getElementById('history-toggle');
            this.historySidebar = document.getElementById('history-sidebar');
            this.closeHistoryBtn = document.getElementById('close-history');

            this.apiKey = null;
            this.history = this.loadHistory();
            this.init();
        }

        init() {
            console.log('🚀 Initializing Answering Guru...');
            console.log('🎯 DOM elements found:', {
                generateButton: !!this.generateButton,
                shortAnswerInput: !!this.shortAnswerInput,
                clientMessageInput: !!this.clientMessageInput
            });

            this.generateButton.addEventListener('click', () => {
                console.log('🖱️ Generate button clicked!');
                this.handleGenerate();
            });
            this.pasteButton.addEventListener('click', () => this.handlePaste());
            this.copyResultBtn.addEventListener('click', () => this.copyResult());

            // Settings functionality
            this.settingsToggle.addEventListener('click', () => this.toggleSettings());
            this.testApiKeyBtn.addEventListener('click', () => this.testApiKey());
            this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());

            // History sidebar functionality
            this.historyToggle.addEventListener('click', () => this.toggleHistory());
            this.closeHistoryBtn.addEventListener('click', () => this.closeHistory());

            // Handle Enter key for short answer input
            this.shortAnswerInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleGenerate();
                }
            });

            // Load API key from localStorage
            this.loadApiKey();

            // Render history
            this.renderHistory();

            // Focus on client message input when page loads
            this.clientMessageInput.focus();
        }

        async handleGenerate() {
            console.log('🔄 Starting generate process...');
            console.log('🎯 handleGenerate called');

            const shortAnswer = this.shortAnswerInput.value.trim();
            const clientMessage = this.clientMessageInput.value.trim();
            console.log('📝 Short answer:', shortAnswer);
            console.log('💬 Client message:', clientMessage);

            if (!clientMessage) {
                console.log('❌ No client message provided');
                alert('Please enter the client\'s message first.');
                return;
            }

            // Check if API key is available
            console.log('🔑 API Key available:', !!this.apiKey);
            if (!this.apiKey) {
                console.log('❌ No API key found');
                alert('Please set your Gemini API key first. You can get one from Google AI Studio.');
                return;
            }

            // Disable button and show loading
            console.log('⏳ Setting loading state...');
            this.setLoading(true);

            try {
                let professionalAnswer;
                let suggestions;

                if (!shortAnswer) {
                    console.log('💡 No short answer provided, generating suggestions...');
                    // Generate suggestions for yes/no context
                    suggestions = await this.generateSuggestions(clientMessage);
                    console.log('✅ Suggestions generated:', suggestions);

                    // Show suggestions
                    this.showSuggestions(suggestions);

                    // Add to history as suggestion
                    this.addToHistory(clientMessage, '[Suggestions Generated]', suggestions.join('\n\n'));

                    console.log('🎉 Suggestions generated successfully!');
                } else {
                    console.log('🚀 Calling Gemini API for professional answer...');
                    professionalAnswer = await this.generateProfessionalAnswer(shortAnswer);
                    console.log('✅ API response received:', professionalAnswer);

                    // Show result
                    console.log('📄 Showing result...');
                    this.showResult(professionalAnswer);

                    // Add to history
                    console.log('💾 Adding to history...');
                    this.addToHistory(clientMessage, shortAnswer, professionalAnswer);

                    console.log('🎉 Generate process completed successfully!');
                }

                // Clear inputs only if we have a result (not suggestions)
                if (professionalAnswer) {
                    console.log('🧹 Clearing inputs...');
                    this.clientMessageInput.value = '';
                    this.shortAnswerInput.value = '';
                }

            } catch (error) {
                console.error('❌ Error generating answer:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                alert('Sorry, I encountered an error while generating the answer. Please check your API key and try again. Check the browser console for details.');
            } finally {
                // Re-enable button
                console.log('🔄 Re-enabling button...');
                this.setLoading(false);
            }
        }

        async handlePaste() {
            try {
                const text = await navigator.clipboard.readText();
                this.clientMessageInput.value = text;
                this.clientMessageInput.focus();

                // Show feedback
                const button = this.pasteButton;
                const originalIcon = button.textContent;
                button.textContent = '✅';
                button.style.background = '#4CAF50';
                setTimeout(() => {
                    button.textContent = originalIcon;
                    button.style.background = '';
                }, 1000);
            } catch (err) {
                console.error('Failed to paste from clipboard:', err);
                // Fallback for older browsers
                this.clientMessageInput.focus();
            }
        }

        setLoading(loading) {
            this.generateButton.disabled = loading;
            if (loading) {
                this.generateButton.innerHTML = '<span class="loading"></span> Generating...';
            } else {
                this.generateButton.innerHTML = '✨ Generate Professional Answer';
            }
        }

        async generateProfessionalAnswer(shortAnswer) {
            const clientMessage = this.clientMessageInput.value.trim();

            const prompt = `You are a professional freelancer. Transform the short answer into a natural, human-like response that directly addresses the client's message.

CLIENT MESSAGE: "${clientMessage || 'No specific context'}"

YOUR SHORT ANSWER: "${shortAnswer}"

Create a natural, conversational response in ENGLISH with these requirements:

1. **HUMAN-LIKE**: Sound like a real person speaking, not a robot
2. **NATURAL FLOW**: Use contractions, casual but professional language
3. **CONTEXT APPROPRIATE**: Answer must directly respond to and be relevant to the client's message
4. **FRIENDLY**: Add warmth and approachability
5. **COMPREHENSIVE**: Provide sufficient detail but keep it conversational
6. **POSITIVE**: Always use a positive and helpful tone

CRITICAL INSTRUCTIONS:
- DO NOT use any markdown formatting (*, **, _, etc.)
- DO NOT include greetings or closings
- DO NOT sound robotic or overly formal
- Write like you're having a natural conversation
- Use normal punctuation and sentence structure
- Be helpful and personable

NATURAL RESPONSE:`;

            console.log('📡 Making API request...');
            console.log('🔗 API URL:', `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey.substring(0, 10)}...`);
            console.log('📝 Prompt length:', prompt.length);

            const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                    generationConfig: {
                        temperature: 0.8,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
            };

            console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (!response.ok) {
                console.log('❌ Response not ok, getting error data...');
                const errorData = await response.json();
                console.log('❌ Error data:', errorData);
                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            console.log('✅ Response ok, parsing JSON...');
            const data = await response.json();
            console.log('📄 Raw response data:', data);

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.log('❌ Invalid response structure');
                throw new Error('Invalid API response');
            }

            const result = data.candidates[0].content.parts[0].text.trim();
            console.log('🎯 Final result:', result);

            return result;
        }

        async generateSuggestions(clientMessage) {
            const prompt = `You are a professional freelancer. Analyze the client's message and provide 3 different suggestion options for how to respond professionally and naturally.

CLIENT MESSAGE: "${clientMessage}"

Analyze this message and provide 3 different response suggestions that would be appropriate for a freelancer. Each suggestion should be:

1. **Context-appropriate**: Directly relevant to what the client asked
2. **Professional yet human**: Natural language, not robotic
3. **Helpful**: Provides value to the client
4. **Concise**: Keep each suggestion to 1-2 sentences

Format your response as exactly 3 numbered suggestions, each starting with a number and a period, with no additional text or formatting.

Example format:
1. First suggestion here
2. Second suggestion here
3. Third suggestion here

SUGGESTIONS:`;

            const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid API response');
            }

            const result = data.candidates[0].content.parts[0].text.trim();

            // Parse the numbered suggestions
            const suggestions = result.split('\n')
                .map(line => line.trim())
                .filter(line => /^\d+\./.test(line))
                .map(line => line.replace(/^\d+\.\s*/, ''));

            return suggestions.slice(0, 3); // Ensure we only return 3 suggestions
        }

        showResult(answer) {
            this.resultContent.textContent = answer;
            this.resultSection.style.display = 'block';

            // Scroll to result section
            this.resultSection.scrollIntoView({ behavior: 'smooth' });
        }

        showSuggestions(suggestions) {
            // Create suggestions HTML
            const suggestionsHtml = suggestions.map((suggestion, index) => `
            <div class="suggestion-item">
                <div class="suggestion-number">${index + 1}</div>
                <div class="suggestion-text">${suggestion}</div>
                <button class="use-suggestion-btn" onclick="answeringGuru.useSuggestion('${suggestion.replace(/'/g, "\\'")}')">
                    Use This
                </button>
            </div>
        `).join('');

            this.resultContent.innerHTML = `
            <div class="suggestions-container">
                <div class="suggestions-header">
                    💡 Here are some suggestion options for your response:
                </div>
                <div class="suggestions-list">
                    ${suggestionsHtml}
                </div>
            </div>
        `;
            this.resultSection.style.display = 'block';

            // Scroll to result section
            this.resultSection.scrollIntoView({ behavior: 'smooth' });
        }

        useSuggestion(suggestion) {
            // Set the suggestion as the short answer
            this.shortAnswerInput.value = suggestion;

            // Hide suggestions and show normal result area
            this.resultSection.style.display = 'none';

            // Focus on the input for editing
            this.shortAnswerInput.focus();

            // Optional: Scroll to the input area
            this.shortAnswerInput.scrollIntoView({ behavior: 'smooth' });
        }

        async copyResult() {
            const text = this.resultContent.textContent;
            if (!text) return;

            try {
                await navigator.clipboard.writeText(text);
                // Show feedback
                const button = this.copyResultBtn;
                const originalText = button.textContent;
                button.innerHTML = '✅ Copied!';
                button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                setTimeout(() => {
                    button.innerHTML = '📋 Copy Answer';
                    button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy result:', err);
                alert('Failed to copy to clipboard');
            }
        }

        addToHistory(clientMessage, shortAnswer, professionalAnswer) {
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                clientMessage,
                shortAnswer,
                professionalAnswer
            };

            this.history.unshift(historyItem);

            // Keep only last 10 items
            if (this.history.length > 10) {
                this.history = this.history.slice(0, 10);
            }

            this.saveHistory();
            this.renderHistory();
        }

        renderHistory() {
            if (this.history.length === 0) {
                this.historyList.innerHTML = '<div class="history-placeholder">Your generated answers will appear here</div>';
                return;
            }

            this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="timestamp">${item.timestamp}</div>
                ${item.clientMessage ? `<div class="client-msg">"${item.clientMessage}"</div>` : ''}
                <div class="short-answer">Short: ${item.shortAnswer}</div>
                <div class="professional-answer">${item.professionalAnswer}</div>
                <button class="copy-history-btn" onclick="answeringGuru.copyFromHistory('${item.professionalAnswer.replace(/'/g, "\\'")}')">📋 Copy</button>
            </div>
        `).join('');
        }

        async copyFromHistory(text) {
            try {
                await navigator.clipboard.writeText(text);
                alert('Answer copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy from history:', err);
                alert('Failed to copy to clipboard');
            }
        }

        loadHistory() {
            try {
                const saved = localStorage.getItem('answering-guru-history');
                return saved ? JSON.parse(saved) : [];
            } catch (err) {
                console.error('Failed to load history:', err);
                return [];
            }
        }

        saveHistory() {
            try {
                localStorage.setItem('answering-guru-history', JSON.stringify(this.history));
            } catch (err) {
                console.error('Failed to save history:', err);
            }
        }

        loadApiKey() {
            this.apiKey = localStorage.getItem('gemini-api-key');
            if (!this.apiKey) {
                this.promptForApiKey();
            }
        }

        toggleSettings() {
            const isVisible = this.settingsPanel.style.display !== 'none';
            this.settingsPanel.style.display = isVisible ? 'none' : 'block';

            if (!isVisible) {
                // Load current API key into input field when opening settings
                this.apiKeyInput.value = this.apiKey || '';
                this.apiKeyInput.focus();
            }
        }

        async testApiKey() {
            const testKey = this.apiKeyInput.value.trim();

            if (!testKey) {
                alert('Please enter an API key to test.');
                return;
            }

            console.log('🧪 Testing API key...');

            // Show testing feedback
            const button = this.testApiKeyBtn;
            const originalText = button.innerHTML;
            button.innerHTML = '⏳ Testing...';
            button.disabled = true;

            try {
                // Make a simple test request
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${testKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: 'Hello, respond with just "OK" if you can read this message.'
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 10,
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                        console.log('✅ API key test successful!');
                        button.innerHTML = '✅ Working!';
                        button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                        alert('✅ API key is working correctly!');
                    } else {
                        throw new Error('Invalid response structure');
                    }
                } else {
                    const errorData = await response.json();
                    console.log('❌ API key test failed:', errorData);
                    throw new Error(errorData.error?.message || 'API test failed');
                }

            } catch (error) {
                console.error('❌ API key test error:', error);
                button.innerHTML = '❌ Failed';
                button.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                alert(`❌ API key test failed: ${error.message}\n\nPlease check your API key and try again.`);
            } finally {
                // Reset button after delay
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
                    button.disabled = false;
                }, 3000);
            }
        }

        saveApiKey() {
            const newApiKey = this.apiKeyInput.value.trim();

            if (!newApiKey) {
                alert('Please enter a valid API key.');
                return;
            }

            // Save to localStorage
            this.apiKey = newApiKey;
            localStorage.setItem('gemini-api-key', this.apiKey);

            // Show success feedback
            const button = this.saveApiKeyBtn;
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Saved!';
            button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';

            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            }, 2000);

            // Close settings panel after a delay
            setTimeout(() => {
                this.settingsPanel.style.display = 'none';
            }, 1500);
        }

        toggleHistory() {
            const isVisible = this.historySidebar.classList.contains('show');
            if (isVisible) {
                this.closeHistory();
            } else {
                this.openHistory();
            }
        }

        openHistory() {
            this.historySidebar.classList.add('show');
            this.historySidebar.style.display = 'flex';
        }

        closeHistory() {
            this.historySidebar.classList.remove('show');
            setTimeout(() => {
                this.historySidebar.style.display = 'none';
            }, 300); // Match transition duration
        }

        promptForApiKey() {
            const apiKey = prompt('Please enter your Gemini API key (get one from Google AI Studio):');
            if (apiKey && apiKey.trim()) {
                this.apiKey = apiKey.trim();
                localStorage.setItem('gemini-api-key', this.apiKey);
            } else {
                alert('API key is required to use this application. Please refresh and enter your key.');
            }
        }
    }
    document.addEventListener('DOMContentLoaded', () => {
        new AnsweringGuru();
    });

})();
