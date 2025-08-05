// JS content from your original script.js
// Modal logic
const modal = document.getElementById('tradeModal');
const addTradeBtn = document.getElementById('addTradeBtn');
const closeModalBtn = document.getElementById('closeModal');
const tradeForm = document.getElementById('tradeForm');
const resultDiv = document.getElementById('result');

addTradeBtn.onclick = function() {
    modal.style.display = 'block';
    tradeForm.reset();
    resultDiv.innerHTML = '';
    document.getElementById('customRiskRewardContainer').style.display = 'none';
    // Set dateOpened to now for new trades in datetime-local format
    if (document.getElementById('dateOpened')) {
        const now = new Date();
        const local = now.toISOString().slice(0,16);
        document.getElementById('dateOpened').value = local;
    }
}
closeModalBtn.onclick = function() {
    modal.style.display = 'none';
    tradeForm.removeAttribute('data-edit-idx');
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        tradeForm.removeAttribute('data-edit-idx');
    }
}

tradeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const tradeType = document.getElementById('tradeType').value;
    const symbol = document.getElementById('symbol').value.trim();
    const entry = parseFloat(document.getElementById('entryPrice').value);
    const stopLossType = document.getElementById('stopLossType').value;
    const stopLossAmount = parseFloat(document.getElementById('stopLossAmount').value);
    const lotSize = parseInt(document.getElementById('lotSize').value);
    const takeProfitTypeValue = takeProfitTypeEl.value;
    let riskReward = rrSelect.value;
    let amountReward = amountInput.value;

    if (riskReward === 'Custom') {
        riskReward = document.getElementById('customRiskReward').value.trim();
    }

    // Calculate stop loss price
    let stopLossPrice = entry;
    if (stopLossType === 'Amount') {
        stopLossPrice = tradeType === 'Buy/Long' ? stopLossAmount : stopLossAmount;
    } else if (stopLossType === 'Percentage') {
        stopLossPrice = tradeType === 'Buy/Long' ? entry * (1 - stopLossAmount / 100) : entry * (1 + stopLossAmount / 100);
    }

    // Calculate risk
    let risk;
    if (tradeType === 'Buy/Long') {
        
        risk = entry - stopLossPrice;
    } else {
        risk = stopLossPrice - entry;
    }

    // Calculate take profit price
    let takeProfitPrice = entry;
    let rrValue = 2; // default for 1:2
    if (takeProfitTypeValue === 'Risk-Reward') {
        if (riskReward === 'Custom') {
            rrValue = parseFloat(document.getElementById('customRiskReward').value.trim()) || 2;
        } else {
            rrValue = parseFloat(riskReward.replace('1:', '')) || 2;
        }
        if (tradeType === 'Buy/Long') {
            takeProfitPrice = entry + (risk * rrValue);
        } else {
            takeProfitPrice = entry - (risk * rrValue);
        }
    } else if (takeProfitTypeValue === 'Amount') {
        rrValue = parseFloat(amountReward) || 0;
        takeProfitPrice = tradeType === 'Buy/Long' ? entry + rrValue : entry - rrValue;
    } else if (takeProfitTypeValue === 'Percentage') {
        takeProfitPrice = tradeType === 'Buy/Long' ? entry * (1 + stopLossAmount / 100) : entry * (1 - stopLossAmount / 100);
    } else if (takeProfitTypeValue === 'Manual') {
        takeProfitPrice = parseFloat(document.getElementById('manualTarget').value);
    }

    // Calculate position value
    let positionValue = entry * lotSize;

    // Calculate potential profit and loss based on entry, stop loss, and target
    let potentialLoss, potentialProfit;
    if (tradeType === 'Buy/Long') {
        potentialLoss = (entry - stopLossPrice) * lotSize;
        potentialProfit = (takeProfitPrice - entry) * lotSize;
    } else {
        potentialLoss = (entry - stopLossPrice) * lotSize;
        potentialProfit = (entry - takeProfitPrice) * lotSize;
    }
    // Ensure profit is not showing total value
   
    potentialProfit = Math.abs(potentialProfit);

    let resultText = '';
    let valid = symbol && entry && stopLossAmount && lotSize;
    if (takeProfitTypeValue === 'Amount') {
        valid = valid && (amountReward && !isNaN(parseFloat(amountReward)));
    } else {
        valid = valid && riskReward;
    }
    if (valid) {
        resultText += `<strong>Stop Loss Price :</strong> ${stopLossPrice.toFixed(2)}<br>`;
        resultText += `<strong>Take Profit Price :</strong> ${takeProfitPrice.toFixed(2)}<br>`;
        resultText += `<strong>Position Value :</strong> ${positionValue.toFixed(2)}<br>`;
        resultText += `<strong>Potential Loss :</strong> ${potentialLoss.toFixed(2)}<br>`;
        resultText += `<strong>Potential Profit :</strong> ${potentialProfit.toFixed(2)}<br>`;
        const editIdx = tradeForm.getAttribute('data-edit-idx');
        // Add dateOpened property
        let dateOpened = document.getElementById('dateOpened').value;
        if (!dateOpened) dateOpened = new Date().toISOString().slice(0,16);
        const tradeObj = { tradeType, symbol, entry, stopLossType, stopLossAmount, lotSize, takeProfitTypeValue, riskReward, amountReward, stopLossPrice: stopLossPrice.toFixed(2), takeProfitPrice: takeProfitPrice.toFixed(2), positionValue: positionValue.toFixed(2), potentialLoss: potentialLoss.toFixed(2), potentialProfit: potentialProfit.toFixed(2), dateOpened };
        if (editIdx !== null) {
            trades[parseInt(editIdx)] = tradeObj;
            tradeForm.removeAttribute('data-edit-idx');
        } else {
            trades.push(tradeObj);
        }
        renderTrades();
        modal.style.display = 'none';
    } else {
        resultText = 'Please fill in all fields.';
    }
    resultDiv.innerHTML = resultText;
});

// Trade history array
let trades = [];

// Load trades from localStorage on page load
function loadTrades() {
    const saved = localStorage.getItem('trades');
    if (saved) {
        try {
            trades = JSON.parse(saved);
        } catch (e) {
            trades = [];
        }
    }
}

// Save trades to localStorage
function saveTrades() {
    localStorage.setItem('trades', JSON.stringify(trades));
}

// Export trades to JSON file
function exportTrades() {
    const dataStr = JSON.stringify(trades, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trades.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import trades from JSON file
function importTrades(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                trades = imported;
                saveTrades();
                renderTrades();
                alert('Trades imported successfully!');
            } else {
                alert('Invalid file format.');
            }
        } catch {
            alert('Error reading file.');
        }
    };
    reader.readAsText(file);
}

// Add Import/Export buttons to the page
window.addEventListener('DOMContentLoaded', function() {
    loadTrades();
    renderTrades();
    const btnContainer = document.createElement('div');
    btnContainer.style.margin = '10px 0';
    document.body.insertBefore(btnContainer, document.body.firstChild);
    document.getElementById('exportBtn').onclick = exportTrades;
    // Removed broken importFile event listener
});

function renderTrades() {
    const tbody = document.querySelector('#tradeTable tbody');
    tbody.innerHTML = '';
    trades.forEach((trade, idx) => {
        let rrDisplay = '';
        const takeProfitType = trade.takeProfitTypeValue || trade.takeProfitType;
        if (takeProfitType === 'Risk-Reward') {
            let rrVal = trade.riskReward;
            if (["1:1","1:2","1:3"].includes(rrVal)) {
                rrDisplay = rrVal;
            } else if (rrVal && !isNaN(parseFloat(rrVal))) {
                rrDisplay = parseFloat(rrVal);
            } else {
                rrDisplay = '';
            }
        } else if (takeProfitType === 'Amount') {
            let amountVal = trade.amountReward || trade.riskReward || '';
            if (amountVal && !isNaN(parseFloat(amountVal))) {
                rrDisplay = parseFloat(amountVal);
            } else {
                rrDisplay = '';
            }
        } else if (takeProfitType === 'Manual') {
            rrDisplay = '';
        } else if (takeProfitType === 'Percentage') {
            rrDisplay = trade.stopLossAmount ? trade.stopLossAmount : '';
        }
        let _potentialProfit = trade.potentialProfit;
        if (takeProfitType == 'Amount' || takeProfitType == 'Manual') {
            _potentialProfit = Math.abs(parseFloat(_potentialProfit) - parseFloat(trade.positionValue));
        }
        _potentialProfit = parseFloat(_potentialProfit) || 0;
        const symbolStr = typeof trade.symbol === 'string' ? trade.symbol : String(trade.symbol);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${trade.dateOpened || ''}</td>
            <td>${trade.tradeType}</td>
            <td>${symbolStr}</td>
            <td>${trade.entry}</td>
            <td>${trade.lotSize}</td>
            <td id="currentPrice${idx}">N/A</td>
            <td id="currentValuation${idx}">N/A</td>
            <td>${trade.stopLossType}</td>
            <td>${trade.stopLossPrice}</td>
            <td>${takeProfitType}</td>
            <td>${rrDisplay}</td>
            <td>${trade.positionValue}</td>
            <td style="color:#d9534f;">${trade.potentialLoss}</td>
            <td style="color:#5cb85c;">${_potentialProfit.toFixed(2)}</td>
            <td>
                <button class="edit-btn" data-idx="${idx}">Edit</button>
                <button class="delete-btn" data-idx="${idx}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
        // Fetch and update current price and valuation
        if (symbolStr) {
            fetch(`/api/price?symbol=${encodeURIComponent(symbolStr)}`)
                .then(res => res.json())
                .then(data => {
                    let price = 'N/A';
                    let valuation = 'N/A';
                    if (data && data.price !== undefined && data.price !== null) {
                        price = data.price;
                        if (!isNaN(price) && !isNaN(trade.lotSize)) {
                            valuation = (price * trade.lotSize).toFixed(2);
                        }
                    }
                    document.getElementById(`currentPrice${idx}`).textContent = price !== undefined ? price : 'N/A';
                    document.getElementById(`currentValuation${idx}`).textContent = valuation;
                })
                .catch(() => {
                    document.getElementById(`currentPrice${idx}`).textContent = 'N/A';
                    document.getElementById(`currentValuation${idx}`).textContent = 'N/A';
                });
        }
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = this.getAttribute('data-idx');
            editTrade(idx);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = this.getAttribute('data-idx');
            deleteTrade(idx);
        });
    });
    saveTrades();
}

function editTrade(idx) {
    const trade = trades[idx];
    document.getElementById('tradeType').value = trade.tradeType;
    document.getElementById('symbol').value = trade.symbol;
    document.getElementById('entryPrice').value = trade.entry;
    document.getElementById('stopLossType').value = trade.stopLossType;
    document.getElementById('stopLossAmount').value = trade.stopLossAmount;
    document.getElementById('lotSize').value = trade.lotSize;
    document.getElementById('takeProfitType').value = trade.takeProfitTypeValue || trade.takeProfitType;
    updateRRAmountInput();
    // Risk-Reward type
    if ((trade.takeProfitTypeValue || trade.takeProfitType) === 'Risk-Reward') {
        if (["1:1","1:2","1:3"].includes(trade.riskReward)) {
            document.getElementById('riskReward').value = trade.riskReward;
            document.getElementById('customRiskRewardContainer').style.display = 'none';
        } else {
            document.getElementById('riskReward').value = 'Custom';
            document.getElementById('customRiskReward').value = trade.riskReward;
            document.getElementById('customRiskRewardContainer').style.display = 'block';
        }
        document.getElementById('amountReward').value = '';
    } else if ((trade.takeProfitTypeValue || trade.takeProfitType) === 'Amount') {
        document.getElementById('riskReward').value = '';
        document.getElementById('customRiskRewardContainer').style.display = 'none';
        document.getElementById('amountReward').value = trade.amountReward || trade.riskReward || '';
    } else {
        document.getElementById('riskReward').value = '';
        document.getElementById('customRiskRewardContainer').style.display = 'none';
        document.getElementById('amountReward').value = '';
    }
    if ((trade.takeProfitTypeValue || trade.takeProfitType) === 'Manual' && trade.takeProfitPrice) {
        document.getElementById('manualTarget').value = trade.takeProfitPrice;
    } else {
        document.getElementById('manualTarget').value = '';
    }
    // Set dateOpened field in datetime-local format
    if (document.getElementById('dateOpened')) {
        let dateVal = trade.dateOpened || '';
        // Try to convert to datetime-local format if needed
        if (dateVal && dateVal.length < 17) {
            // If not ISO, try to parse
            const d = new Date(dateVal);
            if (!isNaN(d)) dateVal = d.toISOString().slice(0,16);
        }
        document.getElementById('dateOpened').value = dateVal;
    }
    // Store the index being edited
    tradeForm.setAttribute('data-edit-idx', idx);
    modal.style.display = 'block';
}

function deleteTrade(idx) {
    trades.splice(idx, 1);
    saveTrades();
    renderTrades();
}


// Show/hide custom risk-reward input
document.getElementById('riskReward').addEventListener('change', function() {
    if (this.value === 'Custom') {
        document.getElementById('customRiskRewardContainer').style.display = 'block';
    } else {
        document.getElementById('customRiskRewardContainer').style.display = 'none';
    }
});

// Add manual target logic to script.js
// Show/hide manual target input based on Take Profit Type

document.getElementById('takeProfitType').addEventListener('change', function() {
    if (this.value === 'Manual') {
        document.getElementById('manualTargetContainer').style.display = 'block';
        document.getElementById('riskReward').parentElement.style.display = 'none';
        document.getElementById('customRiskRewardContainer').style.display = 'none';
    } else {
        document.getElementById('manualTargetContainer').style.display = 'none';
        document.getElementById('riskReward').parentElement.style.display = 'block';
    }
});

// Add logic to script.js for RR/Amount selection
const takeProfitTypeEl = document.getElementById('takeProfitType');
const rrOrAmountRow = document.getElementById('rrOrAmountRow');
const rrLabel = document.getElementById('rrOrAmountLabel');
const rrSelect = document.getElementById('riskReward');
const amountInput = document.getElementById('amountReward');

function updateRRAmountInput() {
    if (takeProfitTypeEl.value === 'Risk-Reward') {
        rrOrAmountRow.style.display = 'flex';
        rrLabel.textContent = 'Risk-Reward Ratio:';
        rrSelect.style.display = 'block';
        rrSelect.required = true;
        amountInput.style.display = 'none';
        amountInput.required = false;
    } else if (takeProfitTypeEl.value === 'Amount') {
        rrOrAmountRow.style.display = 'flex';
        rrLabel.textContent = 'Amount:';
        rrSelect.style.display = 'none';
        rrSelect.required = false;
        amountInput.style.display = 'block';
        amountInput.required = true;
    } else {
        rrOrAmountRow.style.display = 'none';
        rrSelect.required = false;
        amountInput.required = false;
    }
}
takeProfitTypeEl.addEventListener('change', updateRRAmountInput);
window.addEventListener('DOMContentLoaded', updateRRAmountInput);
