// --- Memory Cache Operations ---
let accountBalance = parseFloat(localStorage.getItem('quantum_balance')) || 84500000.00;
let rawTransactions = localStorage.getItem('quantum_transactions');
let transactions = rawTransactions ? JSON.parse(rawTransactions) : [
    { recipient: 'Core Genesis Minting Allocation', amount: 8450.00, type: 'credit', timestamp: 'System Setup' }
];

let activeFilter = 'all';

// --- Global UI Bindings ---
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const logoutBtn = document.getElementById('logout-btn');
const bioTrigger = document.getElementById('biometric-trigger');

const balanceAmount = document.getElementById('balance-amount');
const transferForm = document.getElementById('transfer-form');
const recipientInput = document.getElementById('recipient');
const amountInput = document.getElementById('amount');
const transferMessage = document.getElementById('transfer-message');
const transactionList = document.getElementById('transaction-list');

// HUD & Custom Modules Elements
const hudTimer = document.getElementById('hud-timer');
const hudTimerZone = document.getElementById('hud-timer-zone');
const hudAlerts = document.getElementById('hud-alerts');
const hudClock = document.getElementById('hud-clock');
const fxEur = document.getElementById('fx-eur');
const fxGbp = document.getElementById('fx-gbp');
const fxJpy = document.getElementById('fx-jpy');

let sessionTimeoutSecs = 600; 
let backgroundThread;

// --- App Background Watchers ---
function launchCoreDaemons() {
    // 1. Unified Running Clock
    setInterval(() => {
        hudClock.textContent = new Date().toLocaleTimeString();
    }, 1000);

    // 2. Adaptive Security Watcher 
    backgroundThread = setInterval(() => {
        sessionTimeoutSecs--;
        let m = Math.floor(sessionTimeoutSecs / 60);
        let s = sessionTimeoutSecs % 60;
        hudTimer.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;

        if (sessionTimeoutSecs <= 0) {
            disconnectWorkstation();
        }
    }, 1000);
}

// Session Extension Hook
hudTimerZone.addEventListener('click', () => {
    sessionTimeoutSecs = 600;
    alert('Security Authorization Extended. Access window refreshed.');
});

// --- Security Access Gateways ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (usernameInput.value.toLowerCase() === 'user' && passwordInput.value === '1234') {
        authorizeEntry();
    } else {
        loginError.classList.remove('hidden');
    }
});

// Mock Fingerprint Bypass Trigger
bioTrigger.addEventListener('click', () => {
    usernameInput.value = 'user';
    passwordInput.value = '1234';
    bioTrigger.style.borderColor = 'var(--success)';
    bioTrigger.style.color = 'var(--success)';
    bioTrigger.querySelector('.fingerprint-icon').textContent = '✅';
    setTimeout(authorizeEntry, 600);
});

function authorizeEntry() {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    launchCoreDaemons();
    refreshTerminalLayout();
}

function disconnectWorkstation() {
    clearInterval(backgroundThread);
    sessionTimeoutSecs = 600;
    dashboardContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    loginForm.reset();
    loginError.classList.add('hidden');
    
    // Reset Bio Icon View
    bioTrigger.style.borderColor = 'var(--primary)';
    bioTrigger.style.color = 'var(--text-main)';
    bioTrigger.querySelector('.fingerprint-icon').textContent = '🔘';
}
logoutBtn.addEventListener('click', disconnectWorkstation);

// --- Core Calculations & Data Store Hooks ---
function persistState() {
    localStorage.setItem('quantum_balance', accountBalance.toFixed(2));
    localStorage.setItem('quantum_transactions', JSON.stringify(transactions));
}

function commitTransaction(nodeAddr, volume, allocationType) {
    if (allocationType === 'debit') {
        accountBalance -= volume;
    } else {
        accountBalance += volume;
    }

    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    transactions.push({ recipient: nodeAddr, amount: volume, type: allocationType, timestamp: stamp });
    
    persistState();
    refreshTerminalLayout();
}

// --- Dynamic FX Arbitrage Calculation Engine ---
function calculateFXRates() {
    // Simulated Static Global Multipliers
    const toEUR = 0.92;
    const toGBP = 0.78;
    const toJPY = 158.45;

    fxEur.textContent = `€${(accountBalance * toEUR).toLocaleString(undefined, {maximumFractionDigits:2})}`;
    fxGbp.textContent = `£${(accountBalance * toGBP).toLocaleString(undefined, {maximumFractionDigits:2})}`;
    fxJpy.textContent = `¥${Math.floor(accountBalance * toJPY).toLocaleString()}`;
}

// --- Terminal View Engine ---
function refreshTerminalLayout() {
    // Top-tier math render
    balanceAmount.textContent = accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    calculateFXRates();

    // Critical Liquidity HUD Alert Monitor
    if (accountBalance < 1000) {
        hudAlerts.textContent = 'CRITICAL LOW LIQUIDITY';
        hudAlerts.className = 'badge danger-alert';
    } else {
        hudAlerts.textContent = 'NOMINAL STATE';
        hudAlerts.className = 'badge';
    }

    // Dynamic Filter Ledger Rendering pipeline
    transactionList.innerHTML = '';
    const historicalLogs = transactions.slice().reverse();

    historicalLogs.forEach(tx => {
        if (activeFilter !== 'all' && tx.type !== activeFilter) return;

        const li = document.createElement('li');
        li.className = 'transaction-item';
        const isCredit = tx.type === 'credit';
        
        li.innerHTML = `
            <div>
                <div>${tx.recipient}</div>
                <div class="hud-subtext">${tx.timestamp}</div>
            </div>
            <span class="${isCredit ? 'tx-amount-credit' : 'tx-amount-debit'}">
                ${isCredit ? '+' : '-'}$${tx.amount.toFixed(2)}
            </span>
        `;
        transactionList.appendChild(li);
    });
}

// --- Interactive Filtering Controller ---
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeFilter = e.target.getAttribute('data-filter');
        refreshTerminalLayout();
    });
});

// --- Action & Fund Deployment Handlers ---
transferForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const targetNode = recipientInput.value.trim();
    const volume = parseFloat(amountInput.value);
    transferMessage.className = 'msg hidden';

    if (volume > accountBalance) {
        renderFeedback('Rejected: Target funding violates net balance thresholds.', 'error-msg');
        return;
    }
    if (volume <= 0 || isNaN(volume)) {
        renderFeedback('Rejected: Structural parameter checksum mismatch.', 'error-msg');
        return;
    }

    commitTransaction(`Node Outflow: ${targetNode}`, volume, 'debit');
    transferForm.reset();
    renderFeedback(`Deployment Authorized. Funds routed successfully.`, 'success-msg');
});

// Shortcut Injection Listeners
document.getElementById('quick-deposit-100').addEventListener('click', () => commitTransaction('Liquidity Node Injection', 100.00, 'credit'));
document.getElementById('quick-deposit-500').addEventListener('click', () => commitTransaction('Liquidity Node Injection', 500.00, 'credit'));

function renderFeedback(txt, classStyler) {
    transferMessage.textContent = txt;
    transferMessage.className = `msg ${classStyler}`;
}

// --- Data Export System Utility ---
document.getElementById('export-ledger-btn').addEventListener('click', () => {
    let logOutput = `=== APEX QUANTUM BANKING LEDGER LOG ===\nGenerated on: ${new Date().toLocaleString()}\nCurrent Asset Evaluation: $${accountBalance.toFixed(2)}\n\n`;
    
    transactions.forEach((tx, idx) => {
        const sign = tx.type === 'credit' ? '+' : '-';
        logOutput += `[Log #${idx + 1}] ${tx.timestamp} | ${tx.recipient} | ${sign}$${tx.amount.toFixed(2)}\n`;
    });

    const fileBlob = new Blob([logOutput], { type: 'text/plain' });
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = URL.createObjectURL(fileBlob);
    downloadAnchor.download = `apex-quantum-ledger-${Date.now()}.txt`;
    downloadAnchor.click();
});
