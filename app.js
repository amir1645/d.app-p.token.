// تنظیمات DApp
const CONFIG = {
    CONTRACT_ADDRESS: "0x166dd205590240c90ca4e0e545ad69db47d8f22f",
    TOKEN_P_CONTRACT_ADDRESS: "0x82F7dBe1792436d15bdA22bB3340bD3f45D614Fa"
};

// ABI قرارداد اصلی
const CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "uplineCode", "type": "uint256"},
            {"internalType": "bool", "name": "placeOnLeft", "type": "bool"}
        ],
        "name": "register",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "buyMinerTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "distributeMinerTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawPool",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawSpecials",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
        "name": "getUserInfo",
        "outputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "uint256", "name": "uplineId", "type": "uint256"},
            {"internalType": "uint256", "name": "leftCount", "type": "uint256"},
            {"internalType": "uint256", "name": "rightCount", "type": "uint256"},
            {"internalType": "uint256", "name": "balanceCount", "type": "uint256"},
            {"internalType": "uint256", "name": "specialBalanceCount", "type": "uint256"},
            {"internalType": "uint256", "name": "totalMinerRewards", "type": "uint256"},
            {"internalType": "bool", "name": "isMiner", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "poolBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "minerTokenPool",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastMinerBuyTime",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastPoolWithdrawTime",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "specialRewardPool",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSpecialPoolCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "registrationFee",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalUsers",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// ABI قرارداد توکن P
const TOKEN_P_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "buyPToken",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPTokenPriceInWei",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "pTokenAmount", "type": "uint256"}
        ],
        "name": "sellPToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lockedSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// متغیرهای گلوبال
let provider = null;
let signer = null;
let contract = null;
let tokenPContract = null;
let userAccount = null;
let withdrawTimer = null;
let minerBuyTimer = null;

// کش برای بهبود عملکرد
const cache = {
    userInfo: { data: null, timestamp: 0 },
    pTokenInfo: { data: null, timestamp: 0 },
    minerInfo: { data: null, timestamp: 0 }
};

// تابع تغییر تب
function switchTab(tabName) {
    // مخفی کردن همه تب‌ها
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // غیرفعال کردن همه آیتم‌های ناوبری
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // نمایش تب انتخاب شده
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // فعال کردن آیتم ناوبری مربوطه
    event.currentTarget.classList.add('active');
    
    // بارگذاری داده‌های مربوطه
    if (contract && userAccount) {
        switch(tabName) {
            case 'user':
                loadUserInfo();
                break;
            case 'token-p':
                loadTokenInfo();
                break;
            case 'miner':
                loadMinerInfo();
                break;
            case 'withdraw':
                loadWithdrawInfo();
                break;
        }
    }
}

// تابع اتصال به کیف پول
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showMessage('لطفاً MetaMask را نصب کنید', 'error');
            return;
        }

        showMessage('در حال اتصال...', 'info');
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAccount = await signer.getAddress();
        
        contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        tokenPContract = new ethers.Contract(CONFIG.TOKEN_P_CONTRACT_ADDRESS, TOKEN_P_ABI, signer);
        
        // نمایش اطلاعات حساب
        updateUIAfterConnection();
        
        // بارگذاری اطلاعات اولیه
        await loadInitialData();
        
        showMessage('اتصال با موفقیت برقرار شد!', 'success');
        
    } catch (err) {
        console.error('Connection error:', err);
        showMessage('خطا در اتصال: ' + err.message, 'error');
    }
}

// تابع به‌روزرسانی UI پس از اتصال
function updateUIAfterConnection() {
    const accountDisplay = document.getElementById('account');
    const accountAddress = document.querySelector('.account-address');
    accountAddress.textContent = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
    accountDisplay.style.display = 'block';
    
    document.getElementById('connect-btn').style.display = 'none';
    document.getElementById('disconnect-btn').style.display = 'flex';
}

// تابع بارگذاری اطلاعات اولیه
async function loadInitialData() {
    await Promise.all([
        updateWalletBalance(),
        updateRegistrationFee(),
        checkRegistrationStatus()
    ]);
}

// تابع قطع اتصال
function disconnectWallet() {
    // پاک کردن تایمرها
    if (withdrawTimer) {
        clearInterval(withdrawTimer);
        withdrawTimer = null;
    }
    
    if (minerBuyTimer) {
        clearInterval(minerBuyTimer);
        minerBuyTimer = null;
    }
    
    // پاک کردن کش
    Object.keys(cache).forEach(key => {
        cache[key] = { data: null, timestamp: 0 };
    });
    
    // ریست متغیرها
    provider = null;
    signer = null;
    contract = null;
    tokenPContract = null;
    userAccount = null;
    
    // به‌روزرسانی UI
    document.getElementById('account').style.display = 'none';
    document.getElementById('connect-btn').style.display = 'flex';
    document.getElementById('disconnect-btn').style.display = 'none';
    
    document.getElementById('unregistered-view').style.display = 'block';
    document.getElementById('registered-view').style.display = 'none';
    
    showMessage('اتصال قطع شد', 'info');
}

// تابع به‌روزرسانی هزینه ثبت‌نام
async function updateRegistrationFee() {
    if (!contract) return;

    try {
        const fee = await contract.registrationFee();
        const feeInMatic = ethers.utils.formatEther(fee);
        
        const priceTag = document.querySelector('.price-tag');
        if (priceTag) {
            priceTag.textContent = `${parseFloat(feeInMatic).toFixed(1)} پالیگان`;
        }
        
    } catch (err) {
        console.error('Error fetching registration fee:', err);
    }
}

// تابع بررسی وضعیت ثبت‌نام
async function checkRegistrationStatus() {
    if (!contract || !userAccount) return;

    try {
        const user = await contract.getUserInfo(userAccount);
        
        if (user.id.toString() === '0') {
            document.getElementById('unregistered-view').style.display = 'block';
            document.getElementById('registered-view').style.display = 'none';
        } else {
            document.getElementById('unregistered-view').style.display = 'none';
            document.getElementById('registered-view').style.display = 'block';
            await loadUserInfo();
        }
    } catch (err) {
        console.error('Error checking registration:', err);
        document.getElementById('unregistered-view').style.display = 'block';
        document.getElementById('registered-view').style.display = 'none';
    }
}

// تابع ثبت‌نام
async function register() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    const uplineCodeInput = document.getElementById('upline-address');
    const uplineCode = uplineCodeInput.value.trim();
    const placeOnLeft = document.querySelector('input[name="place"]:checked').value === 'left';

    if (!uplineCode) {
        showMessage('لطفاً شناسه آپلاین معتبر وارد کنید', 'error');
        return;
    }

    const uplineCodeNumber = parseInt(uplineCode);
    if (isNaN(uplineCodeNumber) || uplineCodeNumber <= 0) {
        showMessage('شناسه آپلاین باید یک عدد مثبت باشد', 'error');
        return;
    }

    try {
        showMessage('در حال پردازش ثبت‌نام...', 'info');
        
        const registrationFee = await contract.registrationFee();
        
        const tx = await contract.register(uplineCodeNumber, placeOnLeft, {
            value: registrationFee,
            gasLimit: 500000
        });

        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('ثبت‌نام با موفقیت انجام شد!', 'success');
            await checkRegistrationStatus();
            uplineCodeInput.value = '';
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (err) {
        console.error('Registration error:', err);
        let errorMessage = 'خطا در ثبت‌نام: ';
        
        if (err.code === 'INSUFFICIENT_FUNDS') {
            errorMessage += 'موجودی کافی نیست';
        } else if (err.code === 'ACTION_REJECTED') {
            errorMessage += 'کاربر تراکنش را رد کرد';
        } else if (err.reason) {
            errorMessage += err.reason;
        } else {
            errorMessage += err.message;
        }
        
        showMessage(errorMessage, 'error');
    }
}

// تابع بارگذاری اطلاعات کاربر
async function loadUserInfo() {
    if (!contract || !userAccount) return;

    try {
        const user = await contract.getUserInfo(userAccount);
        cache.userInfo = { data: user, timestamp: Date.now() };
        updateUserUI(user);
        
    } catch (err) {
        console.error('Error loading user info:', err);
        showMessage('خطا در دریافت اطلاعات کاربر', 'error');
    }
}

// تابع به‌روزرسانی UI کاربر
function updateUserUI(user) {
    // اطلاعات اصلی
    document.getElementById('user-id').textContent = user.id.toString();
    document.getElementById('user-upline').textContent = user.uplineId.toString();
    
    // آمار تیم
    const totalTeam = parseInt(user.leftCount) + parseInt(user.rightCount);
    document.getElementById('team-stats-left').textContent = user.leftCount.toString();
    document.getElementById('team-stats-right').textContent = user.rightCount.toString();
    document.getElementById('team-stats-total').textContent = totalTeam.toString();
    
    // تعادل شبکه
    document.getElementById('left-balance').textContent = user.leftCount.toString();
    document.getElementById('right-balance').textContent = user.rightCount.toString();
    document.getElementById('network-balance').textContent = user.balanceCount.toString();
    
    // اطلاعات ویژه
    document.getElementById('special-balance-count').textContent = user.specialBalanceCount.toString();
    
    // قیمت ورود
    const entryPrice = user.entryPrice ? ethers.utils.formatEther(user.entryPrice) : '0';
    document.getElementById('entry-price').textContent = `${entryPrice} پالیگان`;
}

// تابع بارگذاری اطلاعات توکن
async function loadTokenInfo() {
    await Promise.all([
        updatePTokenInfo(),
        updateWalletBalance()
    ]);
}

// تابع به‌روزرسانی اطلاعات توکن P
async function updatePTokenInfo() {
    if (!tokenPContract || !userAccount) return;

    try {
        const [priceInWei, tokenBalance, decimals] = await Promise.all([
            tokenPContract.getPTokenPriceInWei(),
            tokenPContract.balanceOf(userAccount),
            tokenPContract.decimals()
        ]);

        const priceInMatic = ethers.utils.formatEther(priceInWei);
        const formattedBalance = ethers.utils.formatUnits(tokenBalance, decimals);
        const tokenValue = parseFloat(formattedBalance) * parseFloat(priceInMatic);
        
        // به‌روزرسانی UI
        document.getElementById('p-token-price').textContent = parseFloat(priceInMatic).toFixed(8);
        document.getElementById('p-token-balance').textContent = parseFloat(formattedBalance).toFixed(4);
        document.getElementById('p-token-value').textContent = `≈ ${tokenValue.toFixed(6)} پالیگان`;
        document.getElementById('available-tokens-sell').textContent = `${parseFloat(formattedBalance).toFixed(4)} توکن P`;
        
    } catch (err) {
        console.error('Error updating PToken info:', err);
        showMessage('خطا در دریافت اطلاعات توکن P', 'error');
    }
}

// تابع محاسبه تعداد توکن‌های قابل خرید
async function calculateBuyTokens() {
    const buyAmount = parseFloat(document.getElementById('buy-amount').value);
    
    if (!buyAmount || buyAmount <= 0) {
        document.getElementById('tokens-received').textContent = '0 توکن P';
        return;
    }

    try {
        const priceInWei = await tokenPContract.getPTokenPriceInWei();
        const priceInMatic = ethers.utils.formatEther(priceInWei);
        const tokensReceived = buyAmount / parseFloat(priceInMatic);
        
        document.getElementById('tokens-received').textContent = `${tokensReceived.toFixed(4)} توکن P`;
        
    } catch (err) {
        console.error('Error calculating buy tokens:', err);
        document.getElementById('tokens-received').textContent = 'خطا در محاسبه';
    }
}

// تابع محاسبه مقدار پالیگان قابل دریافت از فروش
async function calculateSellMatic() {
    const sellAmount = parseFloat(document.getElementById('sell-amount').value);
    
    if (!sellAmount || sellAmount <= 0) {
        document.getElementById('matic-received').textContent = '0 پالیگان';
        return;
    }

    try {
        const priceInWei = await tokenPContract.getPTokenPriceInWei();
        const priceInMatic = ethers.utils.formatEther(priceInWei);
        const maticReceived = sellAmount * parseFloat(priceInMatic);
        
        document.getElementById('matic-received').textContent = `${maticReceived.toFixed(6)} پالیگان`;
        
    } catch (err) {
        console.error('Error calculating sell matic:', err);
        document.getElementById('matic-received').textContent = 'خطا در محاسبه';
    }
}

// تابع خرید توکن P
async function buyPTokens() {
    if (!tokenPContract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    const buyAmount = document.getElementById('buy-amount').value;
    
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
        showMessage('لطفاً مقدار معتبر وارد کنید', 'error');
        return;
    }

    try {
        showMessage('در حال پردازش خرید...', 'info');
        
        const amountInWei = ethers.utils.parseEther(buyAmount);
        const tx = await tokenPContract.buyPToken({
            value: amountInWei,
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('خرید با موفقیت انجام شد!', 'success');
            await updatePTokenInfo();
            await updateWalletBalance();
            document.getElementById('buy-amount').value = '';
            document.getElementById('tokens-received').textContent = '0 توکن P';
        }
        
    } catch (err) {
        console.error('Buy PToken error:', err);
        showMessage('خطا در خرید: ' + (err.reason || err.message), 'error');
    }
}

// تابع فروش توکن P
async function sellPTokens() {
    if (!tokenPContract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    const sellAmount = document.getElementById('sell-amount').value;
    
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
        showMessage('لطفاً مقدار معتبر وارد کنید', 'error');
        return;
    }

    try {
        // بررسی موجودی
        const tokenBalance = await tokenPContract.balanceOf(userAccount);
        const decimals = await tokenPContract.decimals();
        const formattedBalance = ethers.utils.formatUnits(tokenBalance, decimals);
        
        if (parseFloat(sellAmount) > parseFloat(formattedBalance)) {
            showMessage('موجودی توکن کافی نیست', 'error');
            return;
        }

        showMessage('در حال پردازش فروش...', 'info');
        
        const tokenAmount = ethers.utils.parseUnits(sellAmount, decimals);
        const tx = await tokenPContract.sellPToken(tokenAmount, {
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('فروش با موفقیت انجام شد!', 'success');
            await updatePTokenInfo();
            await updateWalletBalance();
            document.getElementById('sell-amount').value = '';
            document.getElementById('matic-received').textContent = '0 پالیگان';
        }
        
    } catch (err) {
        console.error('Sell PToken error:', err);
        showMessage('خطا در فروش: ' + (err.reason || err.message), 'error');
    }
}

// تابع بارگذاری اطلاعات ماینر
async function loadMinerInfo() {
    await Promise.all([
        updateMinerStats(),
        updateWalletBalance()
    ]);
}

// تابع به‌روزرسانی آمار ماینر
async function updateMinerStats() {
    if (!contract || !userAccount) return;

    try {
        const user = await contract.getUserInfo(userAccount);
        updateMinerUI(user);
        
        // به‌روزرسانی اطلاعات اضافی
        await Promise.all([
            updateMinerPoolBalance(),
            startMinerBuyTimer()
        ]);
        
    } catch (err) {
        console.error('Error updating miner stats:', err);
    }
}

// تابع به‌روزرسانی UI ماینر
function updateMinerUI(user) {
    // وضعیت ماینر
    const isMiner = user.isMiner;
    const minerStatusElement = document.getElementById('miner-status');
    const minerGlobalStatusElement = document.getElementById('miner-global-status');
    
    if (isMiner) {
        minerStatusElement.textContent = 'فعال';
        minerStatusElement.style.color = '#10B981';
        minerGlobalStatusElement.innerHTML = '<div class="status-indicator" style="background: #10B981"></div><span>ماینر فعال</span>';
        minerGlobalStatusElement.classList.remove('inactive');
    } else {
        minerStatusElement.textContent = 'غیرفعال';
        minerStatusElement.style.color = '#FF6584';
        minerGlobalStatusElement.innerHTML = '<div class="status-indicator" style="background: #FF6584"></div><span>ماینر غیرفعال</span>';
        minerGlobalStatusElement.classList.add('inactive');
    }
    
    // پاداش‌های ماینر
    document.getElementById('miner-total-rewards').textContent = `${ethers.utils.formatEther(user.totalMinerRewards || '0')} PToken`;
}

// تابع به‌روزرسانی موجودی استخر ماینر
async function updateMinerPoolBalance() {
    if (!contract) return;

    try {
        const minerPoolBalance = await contract.minerTokenPool();
        const minerPoolBalanceMatic = ethers.utils.formatEther(minerPoolBalance);
        document.getElementById('miner-pool-balance').textContent = `${parseFloat(minerPoolBalanceMatic).toFixed(4)} پالیگان`;
        
    } catch (err) {
        console.error('Error fetching miner pool balance:', err);
    }
}

// تابع شروع تایمر خرید ماینر
async function startMinerBuyTimer() {
    if (!contract) return;

    try {
        if (minerBuyTimer) {
            clearInterval(minerBuyTimer);
        }

        const lastMinerBuyTime = await contract.lastMinerBuyTime();
        const minerBuyInterval = 24 * 60 * 60;
        
        const currentTime = Math.floor(Date.now() / 1000);
        const nextMinerBuyTime = parseInt(lastMinerBuyTime) + minerBuyInterval;
        const timeRemaining = Math.max(0, nextMinerBuyTime - currentTime);
        
        updateMinerTimerDisplay(timeRemaining);
        
        minerBuyTimer = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            const newTimeRemaining = Math.max(0, nextMinerBuyTime - currentTime);
            
            if (newTimeRemaining <= 0) {
                clearInterval(minerBuyTimer);
                document.getElementById('miner-buy-timer').textContent = 'آماده برای خرید';
                document.getElementById('buy-miner-btn').disabled = false;
            } else {
                updateMinerTimerDisplay(newTimeRemaining);
            }
        }, 1000);
        
    } catch (err) {
        console.error('Error starting miner buy timer:', err);
        document.getElementById('miner-buy-timer').textContent = 'خطا در دریافت زمان';
    }
}

// تابع به‌روزرسانی نمایش تایمر ماینر
function updateMinerTimerDisplay(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    document.getElementById('miner-buy-timer').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    document.getElementById('buy-miner-btn').disabled = seconds > 0;
}

// تابع خرید توکن ماینر
async function buyMinerTokens() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال خرید توکن ماینر...', 'info');
        
        const tx = await contract.buyMinerTokens({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('خرید توکن ماینر با موفقیت انجام شد!', 'success');
        await updateMinerStats();
        await updateWalletBalance();
        
    } catch (err) {
        console.error('Buy miner tokens error:', err);
        showMessage('خطا در خرید: ' + (err.reason || err.message), 'error');
    }
}

// تابع توزیع توکن ماینر
async function distributeMinerTokens() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال توزیع توکن ماینر...', 'info');
        
        const tx = await contract.distributeMinerTokens({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('توزیع توکن ماینر با موفقیت انجام شد!', 'success');
        await updateMinerStats();
        await updateWalletBalance();
        
    } catch (err) {
        console.error('Distribute miner tokens error:', err);
        showMessage('خطا در توزیع: ' + (err.reason || err.message), 'error');
    }
}

// تابع بارگذاری اطلاعات برداشت
async function loadWithdrawInfo() {
    await Promise.all([
        updateWithdrawInfo(),
        startWithdrawTimer()
    ]);
}

// تابع به‌روزرسانی اطلاعات برداشت
async function updateWithdrawInfo() {
    if (!contract || !userAccount) return;

    try {
        const [user, poolBalance, specialPoolBalance, specialPoolCount, totalUsers] = await Promise.all([
            contract.getUserInfo(userAccount),
            contract.poolBalance(),
            contract.specialRewardPool(),
            contract.getSpecialPoolCount(),
            contract.totalUsers().catch(() => '0')
        ]);

        // استخر پاداش توسعه
        const poolBalanceMatic = ethers.utils.formatEther(poolBalance);
        document.getElementById('pool-balance').textContent = parseFloat(poolBalanceMatic).toFixed(4);
        document.getElementById('pool-amount').textContent = parseFloat(poolBalanceMatic).toFixed(4);
        document.getElementById('pool-balance-count').textContent = user.balanceCount.toString();
        document.getElementById('pool-registrations').textContent = totalUsers.toString();

        // استخر ویژه
        const specialPoolBalanceMatic = ethers.utils.formatEther(specialPoolBalance);
        document.getElementById('special-pool-balance').textContent = parseFloat(specialPoolBalanceMatic).toFixed(4);
        document.getElementById('special-pool-count').textContent = specialPoolCount.toString();
        document.getElementById('special-amount').textContent = parseFloat(specialPoolBalanceMatic).toFixed(4);
        document.getElementById('user-special-balance').textContent = user.specialBalanceCount.toString();
        
    } catch (err) {
        console.error('Error updating withdraw info:', err);
    }
}

// تابع شروع تایمر برداشت
async function startWithdrawTimer() {
    if (!contract) return;

    try {
        if (withdrawTimer) {
            clearInterval(withdrawTimer);
        }

        const lastWithdrawTime = await contract.lastPoolWithdrawTime();
        const withdrawInterval = 6 * 60 * 60;
        
        const currentTime = Math.floor(Date.now() / 1000);
        const nextWithdrawTime = parseInt(lastWithdrawTime) + withdrawInterval;
        const timeRemaining = Math.max(0, nextWithdrawTime - currentTime);
        
        updateWithdrawTimerDisplay(timeRemaining);
        
        withdrawTimer = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            const newTimeRemaining = Math.max(0, nextWithdrawTime - currentTime);
            
            if (newTimeRemaining <= 0) {
                clearInterval(withdrawTimer);
                document.getElementById('countdown-timer').textContent = 'آماده برای برداشت';
                document.getElementById('pool-withdraw-btn').disabled = false;
                document.getElementById('special-withdraw-btn').disabled = false;
            } else {
                updateWithdrawTimerDisplay(newTimeRemaining);
            }
        }, 1000);
        
    } catch (err) {
        console.error('Error starting withdraw timer:', err);
        document.getElementById('countdown-timer').textContent = 'خطا در دریافت زمان';
    }
}

// تابع به‌روزرسانی نمایش تایمر برداشت
function updateWithdrawTimerDisplay(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    document.getElementById('countdown-timer').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const isDisabled = seconds > 0;
    document.getElementById('pool-withdraw-btn').disabled = isDisabled;
    document.getElementById('special-withdraw-btn').disabled = isDisabled;
}

// تابع برداشت از استخر پاداش توسعه
async function withdrawPool() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال برداشت از استخر پاداش توسعه...', 'info');
        
        const tx = await contract.withdrawPool({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('برداشت با موفقیت انجام شد!', 'success');
        await updateWithdrawInfo();
        await updateWalletBalance();
        await startWithdrawTimer();
        
    } catch (err) {
        console.error('Withdraw pool error:', err);
        showMessage('خطا در برداشت: ' + (err.reason || err.message), 'error');
    }
}

// تابع برداشت از استخر پاداش ویژه
async function withdrawSpecials() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال برداشت از استخر پاداش ویژه...', 'info');
        
        const tx = await contract.withdrawSpecials({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('برداشت ویژه با موفقیت انجام شد!', 'success');
        await updateWithdrawInfo();
        await updateWalletBalance();
        await startWithdrawTimer();
        
    } catch (err) {
        console.error('Withdraw specials error:', err);
        showMessage('خطا در برداشت ویژه: ' + (err.reason || err.message), 'error');
    }
}

// تابع به‌روزرسانی موجودی کیف پول
async function updateWalletBalance() {
    if (!provider || !userAccount) return;

    try {
        const balance = await provider.getBalance(userAccount);
        const balanceInMatic = ethers.utils.formatEther(balance);
        
        const balanceElements = document.querySelectorAll('.wallet-balance');
        balanceElements.forEach(element => {
            element.textContent = `${parseFloat(balanceInMatic).toFixed(4)} پالیگان`;
        });
        
    } catch (err) {
        console.error('Error fetching wallet balance:', err);
    }
}

// تابع نمایش پیام
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `message-toast ${type}`;
    messageElement.classList.add('show');
    
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 5000);
}

// رویدادهای ورودی
document.addEventListener('DOMContentLoaded', function() {
    // محاسبه بلادرنگ برای خرید توکن P
    document.getElementById('buy-amount').addEventListener('input', calculateBuyTokens);
    
    // محاسبه بلادرنگ برای فروش توکن P
    document.getElementById('sell-amount').addEventListener('input', calculateSellMatic);
    
    // بررسی تغییر حساب در MetaMask
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function(accounts) {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                connectWallet();
            }
        });
        
        window.ethereum.on('chainChanged', function() {
            window.location.reload();
        });
        
        // بررسی اتصال خودکار
        if (window.ethereum.selectedAddress) {
            setTimeout(connectWallet, 1000);
        }
    }
});