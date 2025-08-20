(function () {
    "use strict";

    // Storage keys
    const STORAGE_KEYS = {
        budget: "et_budget_v1",
        expenses: "et_expenses_v1",
        currency: "et_currency_v1"
    };

    // Elements
    const budgetForm = document.getElementById("budget-form");
    const budgetInput = document.getElementById("budget-input");
    const currencySelect = document.getElementById("currency-select");
    const summaryBudget = document.getElementById("summary-budget");
    const summarySpent = document.getElementById("summary-spent");
    const summaryBalance = document.getElementById("summary-balance");
    const progress = document.querySelector(".progress");
    const progressFill = document.getElementById("progress-fill");
    const overspendWarning = document.getElementById("overspend-warning");

    const expenseForm = document.getElementById("expense-form");
    const amountInput = document.getElementById("amount-input");
    const categoryInput = document.getElementById("category-input");
    const descriptionInput = document.getElementById("description-input");

    const expenseList = document.getElementById("expense-list");
    const expenseCount = document.getElementById("expense-count");
    const emptyState = document.getElementById("empty-state");

    // State
    let budgetAmount = 0;
    let selectedCurrency = "USD";
    /** @type {{id:string, amount:number, category:string, description:string, createdAt:number}[]} */
    let expenses = [];

    // Utils
    let currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: selectedCurrency });

    function guessCurrency() {
        try {
            const locales = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
            const region = new Intl.Locale(locales[0]).maximize().region;
            // Simple mapping for common regions
            const map = { US: "USD", GB: "GBP", EU: "EUR", CA: "CAD", AU: "AUD", IN: "INR", NG: "NGN" };
            return map[region] || "USD";
        } catch (_) {
            return "USD";
        }
    }

    function formatCurrency(value) {
        const safe = Number.isFinite(value) ? value : 0;
        return currencyFormatter.format(safe);
    }

    function clamp(min, value, max) {
        return Math.min(Math.max(value, min), max);
    }

    function loadState() {
        const storedBudget = localStorage.getItem(STORAGE_KEYS.budget);
        const storedExpenses = localStorage.getItem(STORAGE_KEYS.expenses);
        const storedCurrency = localStorage.getItem(STORAGE_KEYS.currency);
        
        budgetAmount = storedBudget ? parseFloat(storedBudget) : 0;
        if (!Number.isFinite(budgetAmount) || budgetAmount < 0) budgetAmount = 0;
        
        selectedCurrency = storedCurrency || guessCurrency();
        currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: selectedCurrency });
        currencySelect.value = selectedCurrency;
        
        try {
            expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
            if (!Array.isArray(expenses)) expenses = [];
        } catch (_) {
            expenses = [];
        }
    }

    function saveBudget() {
        localStorage.setItem(STORAGE_KEYS.budget, String(budgetAmount));
    }

    function saveCurrency() {
        localStorage.setItem(STORAGE_KEYS.currency, selectedCurrency);
    }

    function saveExpenses() {
        localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
    }

    function calculateSpent() {
        return expenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
    }

    function updateSummaryUI() {
        const totalSpent = calculateSpent();
        const balance = budgetAmount - totalSpent;
        summaryBudget.textContent = formatCurrency(budgetAmount);
        summarySpent.textContent = formatCurrency(totalSpent);
        summaryBalance.textContent = formatCurrency(balance);

        summaryBalance.classList.toggle("negative", balance < 0);

        // Progress percent
        let percentUsed = 0;
        if (budgetAmount > 0) {
            percentUsed = (totalSpent / budgetAmount) * 100;
        } else if (totalSpent > 0) {
            percentUsed = 100;
        }
        const width = clamp(0, percentUsed, 100);
        progressFill.style.width = `${width}%`;

        // State when overspent
        const overspent = balance < 0;
        progress.classList.toggle("overspent", overspent);
        overspendWarning.hidden = !overspent;
        progress.setAttribute("role", "progressbar");
        progress.setAttribute("aria-valuemin", "0");
        progress.setAttribute("aria-valuemax", "100");
        progress.setAttribute("aria-valuenow", String(Math.round(width)));
        progress.setAttribute("aria-label", overspent ? "Budget used, overspent" : "Budget used");
    }

    function renderExpenses() {
        expenseList.innerHTML = "";
        expenses
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .forEach(expense => {
                const li = document.createElement("li");
                li.className = "expense-item";
                li.dataset.id = expense.id;

                const main = document.createElement("div");
                main.className = "expense-item__main";

                const amount = document.createElement("span");
                amount.className = "expense-item__amount";
                amount.textContent = formatCurrency(expense.amount);

                const category = document.createElement("span");
                category.className = "expense-item__category";
                category.textContent = expense.category;

                const description = document.createElement("span");
                description.className = "expense-item__description";
                description.textContent = expense.description || "–";

                main.appendChild(amount);
                main.appendChild(category);
                main.appendChild(description);

                const deleteBtn = document.createElement("button");
                deleteBtn.className = "icon-btn delete-btn";
                deleteBtn.setAttribute("aria-label", "Delete expense");
                deleteBtn.innerHTML = "&#10005;"; // ×

                li.appendChild(main);
                li.appendChild(deleteBtn);
                expenseList.appendChild(li);
            });

        const count = expenses.length;
        expenseCount.textContent = `${count} ${count === 1 ? "item" : "items"}`;
        emptyState.hidden = count !== 0;
    }

    function addExpense(amount, category, description) {
        const expense = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            amount,
            category,
            description: (description || "").trim(),
            createdAt: Date.now()
        };
        expenses.push(expense);
        saveExpenses();
        renderExpenses();
        updateSummaryUI();
    }

    function deleteExpenseById(id) {
        const index = expenses.findIndex(e => e.id === id);
        if (index === -1) return;
        expenses.splice(index, 1);
        saveExpenses();
        renderExpenses();
        updateSummaryUI();
    }

    // Event handlers
    budgetForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const raw = budgetInput.value.trim();
        let next = parseFloat(raw);
        if (!Number.isFinite(next) || next < 0) next = 0;
        budgetAmount = roundToCents(next);
        saveBudget();
        updateSummaryUI();
        budgetInput.value = "";
    });

    currencySelect.addEventListener("change", (e) => {
        selectedCurrency = e.target.value;
        currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: selectedCurrency });
        saveCurrency();
        updateSummaryUI();
        renderExpenses();
    });

    expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const amountRaw = amountInput.value.trim();
        const category = categoryInput.value.trim();
        const description = descriptionInput.value;
        let amount = parseFloat(amountRaw);
        if (!Number.isFinite(amount) || amount <= 0) {
            amountInput.focus();
            return;
        }
        if (!category) {
            categoryInput.focus();
            return;
        }
        amount = roundToCents(amount);
        addExpense(amount, category, description);
        expenseForm.reset();
        amountInput.focus();
    });

    expenseList.addEventListener("click", (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const button = target.closest(".delete-btn");
        if (!button) return;
        const li = button.closest(".expense-item");
        if (!li) return;
        const id = li.dataset.id;
        if (!id) return;
        // Animate out then delete
        li.classList.add("removing");
        li.addEventListener("animationend", () => {
            deleteExpenseById(id);
        }, { once: true });
    });

    function roundToCents(value) {
        return Math.round(value * 100) / 100;
    }

    // PWA Service Worker Registration
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then((registration) => {
                        console.log('Service Worker registered successfully:', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.error('Service Worker registration failed:', error);
                    });
            });
        }
    }

    // Show update notification
    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-notification__content">
                <span>New version available!</span>
                <button class="btn btn--small" onclick="location.reload()">Update</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });

    function showInstallPrompt() {
        const installBtn = document.createElement('div');
        installBtn.className = 'install-prompt';
        installBtn.innerHTML = `
            <div class="install-prompt__content">
                <span>Install Expense Tracker for quick access</span>
                <button class="btn btn--small" onclick="installApp()">Install</button>
                <button class="btn btn--small btn--secondary" onclick="this.parentElement.parentElement.remove()">Not now</button>
            </div>
        `;
        document.body.appendChild(installBtn);
    }

    function installApp() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        }
        // Remove the prompt
        const prompt = document.querySelector('.install-prompt');
        if (prompt) prompt.remove();
    }

    // Init
    loadState();
    renderExpenses();
    updateSummaryUI();
    registerServiceWorker();
})();


