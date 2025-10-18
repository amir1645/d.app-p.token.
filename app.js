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

// سیستم انیمیشن پیشرفته
const AnimationManager = {
    // ایجاد افکت ریپل
    createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple-effect');

        const ripple = button.getElementsByClassName('ripple-effect')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    },

    // ایجاد ذرات متحرک
    createParticles(container, count = 5) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // موقعیت تصادفی
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const size = Math.random() * 3 + 2;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 3;
            
            particle.style.left = `${left}%`;
            particle.style.top = `${top}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            container.appendChild(particle);
        }
    },

    // انیمیشن تایپ‌رایتر
    typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    },

    // انیمیشن شمارش
    countUp(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    },

    // لودینگ اسکلتون
    showSkeleton(element) {
        element.classList.add('skeleton');
    },

    hideSkeleton(element) {
        element.classList.remove('skeleton');
    }
};

// تابع تغییر تب با انیمیشن
function switchTab(tabName) {
    const currentTab = document.querySelector('.tab-content.active');
    const currentNav = document.querySelector('.nav-item.active');
    
    if (currentTab) {
        currentTab.style.animation = 'fadeInUp 0.4s ease-out reverse';
        setTimeout(() => {
            currentTab.classList.remove('active');
        }, 200);
    }
    
    if (currentNav) {
        currentNav.classList.remove('active');
    }
    
    // افزودن افکت ریپل به آیتم ناوبری
    AnimationManager.createRipple(event);
    
    setTimeout(() => {
        // نمایش تب جدید
        document.getElementById(tabName + '-tab').classList.add('active');
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
    }, 200);
}

// تابع اتصال به کیف پول با انیمیشن
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showMessage('لطفاً MetaMask را نصب کنید', 'error');
            return;
        }

        showMessage('در حال اتصال...', 'info');
        
        // افزودن افکت لودینگ به دکمه
        const connectBtn = document.getElementById('connect-btn');
        connectBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> در حال اتصال...';
        connectBtn.disabled = true;

        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAccount = await signer.getAddress();
        
        contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        tokenPContract = new ethers.Contract(CONFIG.TOKEN_P_CONTRACT_ADDRESS, TOKEN_P_ABI, signer);
        
        // نمایش اطلاعات حساب با انیمیشن
        updateUIAfterConnection();
        
        // بارگذاری اطلاعات اولیه
        await loadInitialData();
        
        // بازگرداندن دکمه به حالت عادی
        connectBtn.innerHTML = '<i class="fas fa-plug"></i> اتصال به کیف پول';
        connectBtn.disabled = false;
        
        showMessage('اتصال با موفقیت برقرار شد!', 'success');
        
    } catch (err) {
        console.error('Connection error:', err);
        showMessage('خطا در اتصال: ' + err.message, 'error');
        
        // بازگرداندن دکمه به حالت عادی در صورت خطا
        const connectBtn = document.getElementById('connect-btn');
        connectBtn.innerHTML = '<i class="fas fa-plug"></i> اتصال به کیف پول';
        connectBtn.disabled = false;
    }
}

// تابع به‌روزرسانی UI پس از اتصال
function updateUIAfterConnection() {
    const accountDisplay = document.getElementById('account');
    const accountAddress = document.querySelector('.account-address');
    
    // انیمیشن تایپ‌رایتر برای آدرس
    const shortAddress = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
    AnimationManager.typeWriter(accountAddress, shortAddress, 50);
    
    accountDisplay.style.display = 'block';
    accountDisplay.style.animation = 'fadeInUp 0.8s ease-out';
    
    document.getElementById('connect-btn').style.display = 'none';
    document.getElementById('disconnect-btn').style.display = 'flex';
    
    // ایجاد ذرات متحرک در کارت حساب
    AnimationManager.createParticles(accountDisplay, 8);
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
    // افزودن افکت ریپل
    AnimationManager.createRipple(event);
    
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
    
    // انیمیشن خروج
    const accountDisplay = document.getElementById('account');
    accountDisplay.style.animation = 'fadeInUp 0.6s ease-out reverse';
    
    setTimeout(() => {
        // به‌روزرسانی UI
        accountDisplay.style.display = 'none';
        document.getElementById('connect-btn').style.display = 'flex';
        document.getElementById('disconnect-btn').style.display = 'none';
        
        document.getElementById('unregistered-view').style.display = 'block';
        document.getElementById('registered-view').style.display = 'none';
        
        showMessage('اتصال قطع شد', 'info');
    }, 300);
}

// تابع به‌روزرسانی هزینه ثبت‌نام
async function updateRegistrationFee() {
    if (!contract) return;

    try {
        const fee = await contract.registrationFee();
        const feeInMatic = ethers.utils.formatEther(fee);
        
        const priceTag = document.querySelector('.price-tag');
        if (priceTag) {
            AnimationManager.countUp(priceTag, parseFloat(feeInMatic), 1000);
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

    // افزودن افکت ریپل
    AnimationManager.createRipple(event);

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
        
        // افزودن لودینگ به دکمه
        const registerBtn = event.target;
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> در حال پردازش...';
        registerBtn.disabled = true;

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
            
            // انیمیشن موفقیت
            const successIcon = document.createElement('div');
            successIcon.innerHTML = '<i class="fas fa-check-circle" style="color: #10B981; font-size: 2rem;"></i>';
            successIcon.style.textAlign = 'center';
            successIcon.style.margin = '20px 0';
            successIcon.style.animation = 'bounce 0.6s ease';
            
            const card = document.querySelector('.registration-card');
            card.style.animation = 'pulse 0.5s ease';
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
        
        // انیمیشن خطا
        event.target.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            event.target.style.animation = '';
        }, 500);
    } finally {
        // بازگرداندن دکمه به حالت عادی
        const registerBtn = document.querySelector('.btn-register');
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> تکمیل ثبت‌نام';
        registerBtn.disabled = false;
    }
}

// تابع بارگذاری اطلاعات کاربر
async function loadUserInfo() {
    if (!contract || !userAccount) return;

    try {
        // نمایش اسکلتون لودینگ
        const elements = document.querySelectorAll('#user-id, #user-upline, #entry-price, #team-stats-left, #team-stats-right, #team-stats-total, #left-balance, #right-balance');
        elements.forEach(el => AnimationManager.showSkeleton(el));

        const user = await contract.getUserInfo(userAccount);
        cache.userInfo = { data: user, timestamp: Date.now() };
        updateUserUI(user);
        
        // پنهان کردن اسکلتون
        setTimeout(() => {
            elements.forEach(el => AnimationManager.hideSkeleton(el));
        }, 600);
        
    } catch (err) {
        console.error('Error loading user info:', err);
        showMessage('خطا در دریافت اطلاعات کاربر', 'error');
    }
}

// تابع به‌روزرسانی UI کاربر
function updateUserUI(user) {
    // اطلاعات اصلی با انیمیشن شمارش
    AnimationManager.countUp(document.getElementById('user-id'), parseInt(user.id));
    AnimationManager.countUp(document.getElementById('user-upline'), parseInt(user.uplineId));
    
    // آمار تیم
    const totalTeam = parseInt(user.leftCount) + parseInt(user.rightCount);
    AnimationManager.countUp(document.getElementById('team-stats-left'), parseInt(user.leftCount));
    AnimationManager.countUp(document.getElementById('team-stats-right'), parseInt(user.rightCount));
    AnimationManager.countUp(document.getElementById('team-stats-total'), totalTeam);
    
    // تعادل شبکه
    AnimationManager.countUp(document.getElementById('left-balance'), parseInt(user.leftCount));
    AnimationManager.countUp(document.getElementById('right-balance'), parseInt(user.rightCount));
    
    // قیمت ورود
    const entryPrice = user.entryPrice ? ethers.utils.formatEther(user.entryPrice) : '0';
    document.getElementById('entry-price').textContent = `${parseFloat(entryPrice).toFixed(2)} پالیگان`;
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
        
        // به‌روزرسانی UI با انیمیشن
        AnimationManager.countUp(document.getElementById('p-token-price'), parseFloat(priceInMatic), 1500);
        AnimationManager.countUp(document.getElementById('p-token-balance'), parseFloat(formattedBalance), 1500);
        
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
        
        AnimationManager.countUp(document.getElementById('tokens-received'), tokensReceived, 500);
        
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
        
        AnimationManager.countUp(document.getElementById('matic-received'), maticReceived, 500);
        
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

    // افزودن افکت ریپل
    AnimationManager.createRipple(event);

    const buyAmount = document.getElementById('buy-amount').value;
    
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
        showMessage('لطفاً مقدار معتبر وارد کنید', 'error');
        return;
    }

    try {
        showMessage('در حال پردازش خرید...', 'info');
        
        // افزودن لودینگ به دکمه
        const buyBtn = event.target;
        const originalText = buyBtn.innerHTML;
        buyBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> در حال پردازش...';
        buyBtn.disabled = true;

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
            
            // انیمیشن موفقیت
            event.target.style.animation = 'pulse 0.5s ease';
        }
        
    } catch (err) {
        console.error('Buy PToken error:', err);
        showMessage('خطا در خرید: ' + (err.reason || err.message), 'error');
        
        // انیمیشن خطا
        event.target.style.animation = 'shake 0.5s ease';
    } finally {
        // بازگرداندن دکمه به حالت عادی
        const buyBtn = document.querySelector('.btn-token-action.primary');
        buyBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> خرید توکن P';
        buyBtn.disabled = false;
    }
}

// تابع فروش توکن P
async function sellPTokens() {
    if (!tokenPContract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    // افزودن افکت ریپل
    AnimationManager.createRipple(event);

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
        
        // افزودن لودینگ به دکمه
        const sellBtn = event.target;
        const originalText = sellBtn.innerHTML;
        sellBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> در حال پردازش...';
        sellBtn.disabled = true;

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
            
            // انیمیشن موفقیت
            event.target.style.animation = 'pulse 0.5s ease';
        }
        
    } catch (err) {
        console.error('Sell PToken error:', err);
        showMessage('خطا در فروش: ' + (err.reason || err.message), 'error');
        
        // انیمیشن خطا
        event.target.style.animation = 'shake 0.5s ease';
    } finally {
        // بازگرداندن دکمه به حالت عادی
        const sellBtn = document.querySelector('.btn-token-action.secondary');
        sellBtn.innerHTML = '<i class="fas fa-money-bill-wave"></i> فروش توکن P';
        sellBtn.disabled = false;
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
    const minerRewards = user.totalMinerRewards ? ethers.utils.formatEther(user.totalMinerRewards) : '0';
    AnimationManager.countUp(document.getElementById('miner-total-rewards'), parseFloat(minerRewards), 1500);
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
                
                // انیمیشن آماده شدن
                document.getElementById('miner-buy-timer').style.animation = 'pulse 1s infinite';
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

    // افزودن افکت ریپل
    AnimationManager.createRipple(event);

    try {
        showMessage('در حال خرید توکن ماینر...', 'info');
        
        // افزودن لودینگ به دکمه
        const buyBtn = event.target;
        const originalText = buyBtn.innerHTML;
        buyBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> در حال پردازش...';
        buyBtn.disabled = true;

        const tx = await contract.buyMinerTokens({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('خرید توکن ماینر با موفقیت انجام شد!', 'success');
        await updateMinerStats();
        await updateWalletBalance();
        
        // انیمیشن موفقیت
        event.target.style.animation = 'pulse 0.5s ease';
        
    } catch (err) {
        console.error('Buy miner tokens error:', err);
        showMessage('خطا در خرید: ' + (err.reason || err.message), 'error');
        
        // انیمیشن خطا
        event.target.style.animation = 'shake 0.5s ease';
    } finally {
        // بازگرداندن دکمه به حالت عادی
        const buyBtn = document.getElementById('buy-miner-btn');
        buyBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> خرید توکن ماینر';
        buyBtn.disabled = false;
    }
}

// تابع توزیع توکن ماینر
async function distributeMinerTokens() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    // افزودن افکت ریپل
    AnimationManager.createRipple(event);

    try {
        showMessage('در حال توزیع توکن ماینر...', 'info');
        
        // افزودن لودینگ به دکمه
        const distributeBtn = event.target;
        const originalText = distributeBtn.innerHTML;
        distributeBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> در حال پردازش...';
        distributeBtn.disabled = true;

        const tx = await contract.distributeMinerTokens({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('توزیع توکن ماینر با موفقیت انجام شد!', 'success');
        await updateMinerStats();
        await updateWalletBalance();
        
        // انیمیشن موفقیت
        event.target.style.animation = 'pulse 0.5s ease';
        
    } catch (err) {
        console.error('Distribute miner tokens error:', err);
        showMessage('خطا در توزیع: ' + (err.reason || err.message), 'error');
        
        // انیمیشن خطا
        event.target.style.animation = 'shake 0.5s ease';
    } finally {
        // بازگرداندن دکمه به حالت عادی
        const distributeBtn = document.getElementById('distribute-miner-btn');
        distributeBtn.innerHTML = '<i class="fas fa-share-alt"></i> توزیع توکن ماینر';
        distributeBtn.disabled = false;
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
            contract.poolBalance(), // مورد 21 - موجودی استخر پاداش توسعه
            contract.specialRewardPool(), // مورد 24 - موجودی استخر پاداش ویژه
            contract.getSpecialPoolCount(), // مورد 23 - تعداد سقف‌های استخر ویژه
            contract.totalUsers().catch(() => '0')
        ]);

        // استخر پاداش توسعه
        const poolBalanceMatic = ethers.utils.formatEther(poolBalance);
        AnimationManager.countUp(document.getElementById('pool-balance'), parseFloat(poolBalanceMatic), 1500);
        AnimationManager.countUp(document.getElementById('pool-amount'), parseFloat(poolBalanceMatic), 1500);
        AnimationManager.countUp(document.getElementById('pool-balance-count'), parseInt(user.balanceCount), 1500);
        AnimationManager.countUp(document.getElementById('pool-registrations'), parseInt(totalUsers), 1500);

        // استخر ویژه
        const specialPoolBalanceMatic = ethers.utils.formatEther(specialPoolBalance);
        AnimationManager.countUp(document.getElementById('special-pool-balance'), parseFloat(specialPoolBalanceMatic), 1500);
        AnimationManager.countUp(document.getElementById('special-pool-count'), parseInt(specialPoolCount), 1500);
        AnimationManager.countUp(document.getElementById('special-amount'), parseFloat(specialPoolBalanceMatic), 1500);
        AnimationManager.countUp(document.getElementById('user-special-balance'), parseInt(user.specialBalanceCount), 1500);
        
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
                
                // انیمیشن آماده شدن
                document.getElementById('countdown-timer').style.animation = 'pulse 1s infinite';
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

    // افزودن افکت ریپل
    AnimationManager.createRipple(event);

    try {
        showMessage('در حال برداشت از استخر پاداش توسعه...', 'info');
        
        // افزودن لودینگ به دکمه
        const withdrawBtn = event.target;
        const originalText = withdrawBtn.innerHTML;
        withdrawBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> در حال پردازش...';
        withdrawBtn.disabled = true;

        const tx = await contract.withdrawPool({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('برداشت با موفقیت انجام شد!', 'success');
        await updateWithdrawInfo();
        await updateWalletBalance();
        await startWithdrawTimer();
        
        // انیمیشن موفقیت
        event.target.style.animation = 'pulse 0.5s ease';
        
    } catch (err) {
        console.error('Withdraw pool error:', err);
        showMessage('خطا در برداشت: ' + (err.reason || err.message), 'error');
        
        // انیمیشن خطا
        event.target.style.animation = 'shake 0.5s ease';
    } finally {
        // بازگرداندن دکمه به حالت عادی
        const withdrawBtn = document.getElementById('pool-withdraw-btn');
        withdrawBtn.innerHTML = '<i class="fas fa-download"></i> برداشت پاداش توسعه';
        withdrawBtn.disabled = false;
    }
}

// تابع برداشت از استخر پاداش ویژه
async function withdrawSpecials() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    // افزودن افکت ریپل
    AnimationManager.createRipple(event);

    try {
        showMessage('در حال برداشت از استخر پاداش ویژه...', 'info');
        
        // افزودن لودینگ به دکمه
        const withdrawBtn = event.target;
        const originalText = withdrawBtn.innerHTML;
        withdrawBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> در حال پردازش...';
        withdrawBtn.disabled = true;

        const tx = await contract.withdrawSpecials({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('برداشت ویژه با موفقیت انجام شد!', 'success');
        await updateWithdrawInfo();
        await updateWalletBalance();
        await startWithdrawTimer();
        
        // انیمیشن موفقیت
        event.target.style.animation = 'pulse 0.5s ease';
        
    } catch (err) {
        console.error('Withdraw specials error:', err);
        showMessage('خطا در برداشت ویژه: ' + (err.reason || err.message), 'error');
        
        // انیمیشن خطا
        event.target.style.animation = 'shake 0.5s ease';
    } finally {
        // بازگرداندن دکمه به حالت عادی
        const withdrawBtn = document.getElementById('special-withdraw-btn');
        withdrawBtn.innerHTML = '<i class="fas fa-download"></i> برداشت ویژه';
        withdrawBtn.disabled = false;
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
            AnimationManager.countUp(element, parseFloat(balanceInMatic), 1000);
        });
        
    } catch (err) {
        console.error('Error fetching wallet balance:', err);
    }
}

// تابع نمایش پیام با انیمیشن پیشرفته
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `message-toast ${type}`;
    messageElement.classList.add('show');
    
    // افزودن افکت ورود
    messageElement.style.animation = 'fadeInUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    setTimeout(() => {
        messageElement.classList.remove('show');
        messageElement.style.animation = 'fadeInUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) reverse';
    }, 5000);
}

// افزودن انیمیشن شیک برای خطا
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// رویدادهای ورودی
document.addEventListener('DOMContentLoaded', function() {
    // محاسبه بلادرنگ برای خرید توکن P
    document.getElementById('buy-amount').addEventListener('input', calculateBuyTokens);
    
    // محاسبه بلادرنگ برای فروش توکن P
    document.getElementById('sell-amount').addEventListener('input', calculateSellMatic);
    
    // افزودن افکت ریپل به تمام دکمه‌ها
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', AnimationManager.createRipple);
    });
    
    // ایجاد ذرات متحرک در هدر
    AnimationManager.createParticles(document.querySelector('.mobile-header'), 12);
    
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
    
    // افزودن انیمیشن‌های ورود به عناصر
    setTimeout(() => {
        document.querySelectorAll('.animate-on-load').forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('animate-fade-in-up');
        });
    }, 100);
});