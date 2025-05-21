const socket = io();
let username = '';
let oppositeUser = '';

// Initialize body particles immediately
particlesJS('body-particles', {
    particles: {
        number: { value: 50, density: { enable: true, value_area: 700 } },
        color: { value: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC107'] },
        shape: { type: 'circle' },
        opacity: { value: 1.0, random: true },
        size: { value: 30, random: true },
        line_linked: { enable: false },
        move: { enable: true, speed: 1, direction: 'none', random: true }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: false }, onclick: { enable: false } },
    },
    retina_detect: true
});

// Splash screen hide after 2 seconds
setTimeout(() => {
    document.querySelector('.splash-screen').style.display = 'none';
    document.querySelector('.username-screen').style.display = 'block';
}, 2000);

function startChat() {
    username = document.getElementById('username').value.trim();
    if (username) {
        document.querySelector('.username-screen').style.display = 'none';
        document.querySelector('.chat-container').style.display = 'flex';
        socket.emit('join', username);
        // Initialize chat area particles
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC107'] },
                shape: { type: 'circle' },
                opacity: { value: 0.7, random: true },
                size: { value: 6, random: true },
                line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: 'none', random: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
                modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
            },
            retina_detect: true
        });
    } else {
        alert('Please enter a username');
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();
    if (text) {
        socket.emit('sendMessage', { sender: username, text });
        messageInput.value = '';
    }
}

function refreshChat() {
    // Clear current messages in the UI
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '<div id="particles-js"></div>'; // Re-add particles div
    // Reinitialize particles for chat area
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC107'] },
            shape: { type: 'circle' },
            opacity: { value: 0.7, random: true },
            size: { value: 6, random: true },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
            modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
    // Request server to send latest messages
    socket.emit('requestMessages');
}

socket.on('loadMessages', (messages) => {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '<div id="particles-js"></div>'; // Ensure particles div is present
    messages.forEach(msg => displayMessage(msg));
    // Reinitialize particles after clearing
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC107'] },
            shape: { type: 'circle' },
            opacity: { value: 0.7, random: true },
            size: { value: 6, random: true },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
            modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
});

socket.on('receiveMessage', (msg) => {
    displayMessage(msg);
    if (msg.sender !== username) {
        oppositeUser = msg.sender;
        document.querySelector('.chat-header span').textContent = oppositeUser || 'Chat App';
    }
});

socket.on('typing', (user) => {
    if (user !== username) {
        const chatMessages = document.getElementById('chatMessages');
        let typingDiv = document.getElementById('typing');
        if (!typingDiv) {
            typingDiv = document.createElement('div');
            typingDiv.id = 'typing';
            typingDiv.className = 'typing-indicator';
            chatMessages.appendChild(typingDiv);
        }
        typingDiv.textContent = `${user} is typing...`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(() => typingDiv.remove(), 2000);
    }
});

document.getElementById('messageInput').addEventListener('input', () => {
    socket.emit('typing', username);
});

function displayMessage(msg) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.sender === username ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <div>${msg.text}</div>
        <div class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message on Enter key
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});