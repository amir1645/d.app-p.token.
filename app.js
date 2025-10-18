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
        "name": "contractBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
        "name": "buyMinerWithContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getWithdrawTime",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastWithdrawTime",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "specialPoolBalance",
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
                fetchUserInfo();
                break;
            case 'token-p':
                updatePTokenInfo();
                break;
            case 'miner':
                updateMinerStats();
                updateWalletBalance();
                break;
            case 'withdraw':
                updateWithdrawInfo();
                startWithdrawTimer();
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
        const accountDisplay = document.getElementById('account');
        const accountAddress = document.querySelector('.account-address');
        accountAddress.textContent = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
        accountDisplay.style.display = 'block';
        
        document.getElementById('connect-btn').style.display = 'none';
        document.getElementById('disconnect-btn').style.display = 'flex';
        
        // بارگذاری اطلاعات اولیه
        await updateWalletBalance();
        await updatePTokenInfo();
        await checkRegistrationStatus();
        await updateRegistrationFee();
        
        showMessage('اتصال با موفقیت برقرار شد!', 'success');
        
    } catch (err) {
        console.error('Connection error:', err);
        showMessage('خطا در اتصال: ' + err.message, 'error');
    }
}

// تابع قطع اتصال
function disconnectWallet() {
    provider = null;
    signer = null;
    contract = null;
    tokenPContract = null;
    userAccount = null;
    
    if (withdrawTimer) {
        clearInterval(withdrawTimer);
        withdrawTimer = null;
    }
    
    if (minerBuyTimer) {
        clearInterval(minerBuyTimer);
        minerBuyTimer = null;
    }
    
    document.getElementById('account').style.display = 'none';
    document.getElementById('connect-btn').style.display = 'flex';
    document.getElementById('disconnect-btn').style.display = 'none';
    
    document.getElementById('unregistered-view').style.display = 'block';
    document.getElementById('registered-view').style.display = 'none';
    
    // ریست کردن مقادیر
    document.getElementById('p-token-price').textContent = '0';
    document.getElementById('p-token-balance').textContent = '0';
    document.getElementById('p-token-value').textContent = '≈ 0 پالیگان';
    
    showMessage('اتصال قطع شد', 'info');
}

// تابع به‌روزرسانی هزینه ثبت‌نام از قرارداد
async function updateRegistrationFee() {
    if (!contract) return;

    try {
        const fee = await contract.registrationFee();
        const feeInMatic = ethers.utils.formatEther(fee);
        
        // به‌روزرسانی نمایش هزینه در UI
        const priceTag = document.querySelector('.price-tag');
        if (priceTag) {
            priceTag.textContent = `${parseFloat(feeInMatic).toFixed(1)} پالیگان`;
        }
        
    } catch (err) {
        console.error('Error fetching registration fee:', err);
        // استفاده از مقدار پیش‌فرض در صورت خطا
        const priceTag = document.querySelector('.price-tag');
        if (priceTag) {
            priceTag.textContent = '350 پالیگان';
        }
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
            await fetchUserInfo();
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

    // اعتبارسنجی ورودی‌ها
    if (!uplineCode) {
        showMessage('لطفاً شناسه آپلاین معتبر وارد کنید', 'error');
        uplineCodeInput.focus();
        return;
    }

    const uplineCodeNumber = parseInt(uplineCode);
    if (isNaN(uplineCodeNumber) || uplineCodeNumber <= 0) {
        showMessage('شناسه آپلاین باید یک عدد مثبت باشد', 'error');
        uplineCodeInput.focus();
        return;
    }

    try {
        showMessage('در حال پردازش ثبت‌نام...', 'info');
        
        // دریافت هزینه ثبت‌نام از قرارداد
        let registrationFee;
        try {
            registrationFee = await contract.registrationFee();
            console.log('Registration fee from contract:', registrationFee.toString());
        } catch (feeError) {
            console.error('Error getting registration fee:', feeError);
            // استفاده از مقدار پیش‌فرض اگر تابع وجود نداشت
            registrationFee = ethers.utils.parseEther("350");
        }

        // نمایش جزئیات تراکنش برای کاربر
        const feeInMatic = ethers.utils.formatEther(registrationFee);
        showMessage(`هزینه ثبت‌نام: ${feeInMatic} پالیگان - در حال ارسال تراکنش...`, 'info');

        // فراخوانی تابع register در قرارداد
        const tx = await contract.register(uplineCodeNumber, placeOnLeft, {
            value: registrationFee,
            gasLimit: 500000 // افزایش گس Limit برای اطمینان
        });

        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        // انتظار برای تایید تراکنش
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);
        
        // بررسی وضعیت تراکنش
        if (receipt.status === 1) {
            showMessage('ثبت‌نام با موفقیت انجام شد!', 'success');
            
            // به‌روزرسانی وضعیت
            await checkRegistrationStatus();
            await fetchUserInfo();
            
            // ریست کردن فرم
            uplineCodeInput.value = '';
            
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (err) {
        console.error('Registration error:', err);
        
        // مدیریت خطاهای خاص
        let errorMessage = 'خطا در ثبت‌نام: ';
        
        if (err.code === 'INSUFFICIENT_FUNDS') {
            errorMessage += 'موجودی کافی نیست';
        } else if (err.code === 'ACTION_REJECTED') {
            errorMessage += 'کاربر تراکنش را رد کرد';
        } else if (err.reason) {
            // استفاده از پیام خطای قرارداد
            errorMessage += err.reason;
        } else if (err.message) {
            errorMessage += err.message;
        } else {
            errorMessage += 'خطای ناشناخته';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// تابع دریافت اطلاعات کاربر - کامل‌شده
async function fetchUserInfo() {
    if (!contract || !userAccount) return;

    try {
        console.log('Fetching complete user info for:', userAccount);
        
        const user = await contract.getUserInfo(userAccount);
        console.log('Complete user data from contract:', user);
        
        // اطلاعات اصلی کاربر
        document.getElementById('user-id').textContent = user.id.toString();
        document.getElementById('user-upline').textContent = user.uplineId.toString();
        
        // محاسبه مجموع کل کاربران در تیم (چپ + راست)
        const totalTeamMembers = parseInt(user.leftCount) + parseInt(user.rightCount);
        document.getElementById('total-referrals').textContent = totalTeamMembers.toString();
        
        // اطلاعات تعادل
        document.getElementById('balance-count').textContent = user.balanceCount.toString();
        document.getElementById('left-balance').textContent = user.leftCount.toString();
        document.getElementById('right-balance').textContent = user.rightCount.toString();
        
        // اطلاعات ویژه
        document.getElementById('special-balance-count').textContent = user.specialBalanceCount.toString();
        
        // قیمت ورود
        const entryPrice = user.entryPrice ? ethers.utils.formatEther(user.entryPrice) : '0';
        document.getElementById('entry-price').textContent = `${entryPrice} پالیگان`;
        
        // اطلاعات ذخیره شده (saveLeft و saveRight)
        document.getElementById('save-left').textContent = user.saveLeft ? user.saveLeft.toString() : '0';
        document.getElementById('save-right').textContent = user.saveRight ? user.saveRight.toString() : '0';
        
        console.log('Complete user info updated in UI');
        
        // به‌روزرسانی آمار پیشرفته
        await updateAdvancedStats(user);
        
    } catch (err) {
        console.error('Error fetching complete user info:', err);
        showMessage('خطا در دریافت اطلاعات کامل کاربر', 'error');
    }
}

// تابع دریافت آمار پیشرفته
async function updateAdvancedStats(user) {
    if (!contract) return;

    try {
        // دریافت اطلاعات مستقیم کاربر (در صورت موجود بودن)
        let directLeft = '0';
        let directRight = '0';
        
        try {
            const directInfo = await contract.getUserDirects(user.id);
            directLeft = directInfo.leftId !== '0' ? '✓' : '✗';
            directRight = directInfo.rightId !== '0' ? '✓' : '✗';
        } catch (directError) {
            console.log('getUserDirects not available');
        }
        
        document.getElementById('direct-left').textContent = directLeft;
        document.getElementById('direct-right').textContent = directRight;
        
        // محاسبه درصد پیشرفت
        const leftCount = parseInt(user.leftCount);
        const rightCount = parseInt(user.rightCount);
        const totalTeam = leftCount + rightCount;
        
        // محاسبه تعادل شبکه
        const networkBalance = Math.min(leftCount, rightCount);
        document.getElementById('network-balance').textContent = networkBalance.toString();
        
        // محاسبه درصد تکمیل
        const progressPercent = totalTeam > 0 ? Math.min(100, Math.floor((networkBalance / 2) * 100)) : 0;
        document.getElementById('progress-percent').textContent = `${progressPercent}%`;
        
        // به‌روزرسانی نوار پیشرفت
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progressPercent}%`;
        }
        
        // آمار تیم چپ و راست
        document.getElementById('team-stats-left').textContent = leftCount.toString();
        document.getElementById('team-stats-right').textContent = rightCount.toString();
        document.getElementById('team-stats-total').textContent = totalTeam.toString();
        
        // نمایش وضعیت ویژه
        const specialStatus = user.specialBalanceCount > 0 ? 'فعال' : 'غیرفعال';
        document.getElementById('special-status').textContent = specialStatus;
        document.getElementById('special-status').className = 
            user.specialBalanceCount > 0 ? 'status-active' : 'status-inactive';
            
    } catch (err) {
        console.error('Error updating advanced stats:', err);
    }
}

// تابع به‌روزرسانی اطلاعات توکن P - دقیق
async function updatePTokenInfo() {
    if (!tokenPContract || !userAccount) {
        console.log('Token contract or user account not available');
        return;
    }

    try {
        // دریافت قیمت واقعی توکن از قرارداد
        const priceInWei = await tokenPContract.getPTokenPriceInWei();
        const priceInMatic = ethers.utils.formatEther(priceInWei);
        
        // دریافت موجودی توکن کاربر
        const tokenBalance = await tokenPContract.balanceOf(userAccount);
        const decimals = await tokenPContract.decimals();
        const formattedBalance = ethers.utils.formatUnits(tokenBalance, decimals);
        
        // محاسبه ارزش کل با قیمت واقعی
        const tokenValue = parseFloat(formattedBalance) * parseFloat(priceInMatic);
        
        // قیمت اولیه ثابت - 0.00001 پالیگان (برای محاسبه درصد رشد)
        const initialPrice = 0.00001;
        const currentPriceNum = parseFloat(priceInMatic);
        
        // محاسبه درصد رشد نسبت به قیمت اولیه
        const growthPercentage = initialPrice > 0 ? 
            ((currentPriceNum - initialPrice) / initialPrice) * 100 : 0;
        
        // به‌روزرسانی UI
        document.getElementById('p-token-price').textContent = parseFloat(priceInMatic).toFixed(8);
        document.getElementById('p-token-balance').textContent = parseFloat(formattedBalance).toFixed(4);
        document.getElementById('p-token-value').textContent = `≈ ${tokenValue.toFixed(6)} پالیگان`;
        
        // به‌روزرسانی موجودی توکن برای فروش
        document.getElementById('available-tokens-sell').textContent = `${parseFloat(formattedBalance).toFixed(4)} توکن P`;
        
        // به‌روزرسانی درصد رشد
        const growthCard = document.getElementById('growth-card');
        const growthPercentageElement = document.getElementById('growth-percentage');
        const initialPriceElement = document.getElementById('initial-price');
        
        growthPercentageElement.textContent = `${growthPercentage.toFixed(2)}%`;
        initialPriceElement.textContent = `${initialPrice.toFixed(6)} پالیگان`;
        
        // تغییر رنگ بر اساس مثبت یا منفی بودن رشد
        if (growthPercentage > 0) {
            growthCard.classList.remove('negative');
            growthCard.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))';
            growthCard.style.border = '1px solid rgba(16, 185, 129, 0.2)';
        } else if (growthPercentage < 0) {
            growthCard.classList.add('negative');
            growthCard.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))';
            growthCard.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        } else {
            growthCard.classList.remove('negative');
            growthCard.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))';
            growthCard.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        }
        
        // به‌روزرسانی موجودی پالیگان برای خرید
        await updateWalletBalance();
        
    } catch (err) {
        console.error('Error fetching PToken info:', err);
        showMessage('خطا در دریافت اطلاعات توکن P', 'error');
    }
}

// تابع محاسبه تعداد توکن‌های قابل خرید - دقیق
async function calculateBuyTokens() {
    const buyAmount = parseFloat(document.getElementById('buy-amount').value);
    
    if (!buyAmount || buyAmount <= 0) {
        document.getElementById('tokens-received').textContent = '0 توکن P';
        document.getElementById('current-token-price').textContent = '0 پالیگان';
        return;
    }

    try {
        // دریافت قیمت دقیق از قرارداد
        const priceInWei = await tokenPContract.getPTokenPriceInWei();
        const priceInMatic = ethers.utils.formatEther(priceInWei);
        
        // محاسبه تعداد توکن‌های دریافتی
        const tokensReceived = buyAmount / parseFloat(priceInMatic);
        
        // به‌روزرسانی UI
        document.getElementById('tokens-received').textContent = `${tokensReceived.toFixed(4)} توکن P`;
        document.getElementById('current-token-price').textContent = `${parseFloat(priceInMatic).toFixed(8)} پالیگان`;
        
    } catch (err) {
        console.error('Error calculating buy tokens:', err);
        document.getElementById('tokens-received').textContent = 'خطا در محاسبه';
        document.getElementById('current-token-price').textContent = 'خطا در محاسبه';
    }
}

// تابع محاسبه مقدار پالیگان قابل دریافت از فروش - دقیق
async function calculateSellMatic() {
    const sellAmount = parseFloat(document.getElementById('sell-amount').value);
    
    if (!sellAmount || sellAmount <= 0) {
        document.getElementById('matic-received').textContent = '0 پالیگان';
        document.getElementById('current-sell-price').textContent = '0 پالیگان';
        return;
    }

    try {
        // دریافت قیمت دقیق از قرارداد
        const priceInWei = await tokenPContract.getPTokenPriceInWei();
        const priceInMatic = ethers.utils.formatEther(priceInWei);
        
        // محاسبه مقدار پالیگان دریافتی
        const maticReceived = sellAmount * parseFloat(priceInMatic);
        
        // به‌روزرسانی UI
        document.getElementById('matic-received').textContent = `${maticReceived.toFixed(6)} پالیگان`;
        document.getElementById('current-sell-price').textContent = `${parseFloat(priceInMatic).toFixed(8)} پالیگان`;
        
    } catch (err) {
        console.error('Error calculating sell matic:', err);
        document.getElementById('matic-received').textContent = 'خطا در محاسبه';
        document.getElementById('current-sell-price').textContent = 'خطا در محاسبه';
    }
}

// تابع خرید توکن P - دقیقاً متصل به قرارداد
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
        
        // تبدیل مقدار به Wei
        const amountInWei = ethers.utils.parseEther(buyAmount);
        
        // فراخوانی تابع buyPToken در قرارداد
        const tx = await tokenPContract.buyPToken({
            value: amountInWei,
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        // انتظار برای تایید تراکنش
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('خرید با موفقیت انجام شد!', 'success');
            
            // به‌روزرسانی اطلاعات
            await updatePTokenInfo();
            await updateWalletBalance();
            
            // ریست کردن فرم
            document.getElementById('buy-amount').value = '';
            document.getElementById('tokens-received').textContent = '0 توکن P';
            
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (err) {
        console.error('Buy PToken error:', err);
        
        let errorMessage = 'خطا در خرید: ';
        if (err.code === 'INSUFFICIENT_FUNDS') {
            errorMessage += 'موجودی کافی نیست';
        } else if (err.code === 'ACTION_REJECTED') {
            errorMessage += 'کاربر تراکنش را رد کرد';
        } else if (err.reason) {
            errorMessage += err.reason;
        } else if (err.message) {
            errorMessage += err.message;
        } else {
            errorMessage += 'خطای ناشناخته';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// تابع فروش توکن P - دقیقاً متصل به قرارداد
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
        // بررسی موجودی کافی
        const tokenBalance = await tokenPContract.balanceOf(userAccount);
        const decimals = await tokenPContract.decimals();
        const formattedBalance = ethers.utils.formatUnits(tokenBalance, decimals);
        
        if (parseFloat(sellAmount) > parseFloat(formattedBalance)) {
            showMessage('موجودی توکن کافی نیست', 'error');
            return;
        }

        showMessage('در حال پردازش فروش...', 'info');
        
        // تبدیل مقدار توکن به واحد صحیح
        const tokenAmount = ethers.utils.parseUnits(sellAmount, decimals);
        
        // فراخوانی تابع sellPToken در قرارداد
        const tx = await tokenPContract.sellPToken(tokenAmount, {
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        // انتظار برای تایید تراکنش
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('فروش با موفقیت انجام شد!', 'success');
            
            // به‌روزرسانی اطلاعات
            await updatePTokenInfo();
            await updateWalletBalance();
            
            // ریست کردن فرم
            document.getElementById('sell-amount').value = '';
            document.getElementById('matic-received').textContent = '0 پالیگان';
            
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (err) {
        console.error('Sell PToken error:', err);
        
        let errorMessage = 'خطا در فروش: ';
        if (err.code === 'INSUFFICIENT_FUNDS') {
            errorMessage += 'موجودی کافی نیست';
        } else if (err.code === 'ACTION_REJECTED') {
            errorMessage += 'کاربر تراکنش را رد کرد';
        } else if (err.reason) {
            errorMessage += err.reason;
        } else if (err.message) {
            errorMessage += err.message;
        } else {
            errorMessage += 'خطای ناشناخته';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// تابع به‌روزرسانی آمار ماینر - دقیق
async function updateMinerStats() {
    if (!contract || !userAccount) return;

    try {
        const user = await contract.getUserInfo(userAccount);
        
        // به‌روزرسانی وضعیت ماینر از قرارداد
        const minerStatusElement = document.getElementById('miner-status');
        const minerGlobalStatusElement = document.getElementById('miner-global-status');
        
        if (user.isMiner) {
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
        
        // به‌روزرسانی پاداش‌های ماینر از قرارداد
        document.getElementById('miner-total-rewards').textContent = `${ethers.utils.formatEther(user.totalMinerRewards || '0')} PToken`;
        
        // وضعیت ماینر با جزئیات بیشتر
        const minerDetailedStatus = document.getElementById('miner-detailed-status');
        if (minerDetailedStatus) {
            minerDetailedStatus.textContent = user.isMiner ? 
                'شما در سیستم ماینر فعال هستید' : 
                'شما در سیستم ماینر فعال نیستید';
            minerDetailedStatus.style.color = user.isMiner ? '#10B981' : '#FF6584';
        }
        
        // به‌روزرسانی موجودی استخر ماینر
        await updateMinerPoolBalance();
        
        // به‌روزرسانی تعداد توکن‌های قابل توزیع
        await updateDistributableTokens();
        
        // شروع تایمر خرید ماینر
        await startMinerBuyTimer();
        
        // بررسی وضعیت توزیع ماینر
        await checkMinerDistributionStatus();
        
    } catch (err) {
        console.error('Error fetching miner stats:', err);
    }
}

// تابع به‌روزرسانی تعداد توکن‌های قابل توزیع
async function updateDistributableTokens() {
    if (!tokenPContract) return;

    try {
        // دریافت موجودی توکن P قرارداد
        const contractTokenBalance = await tokenPContract.balanceOf(tokenPContract.address);
        const decimals = await tokenPContract.decimals();
        const formattedContractBalance = ethers.utils.formatUnits(contractTokenBalance, decimals);
        
        // دریافت عرضه قفل شده
        const lockedSupply = await tokenPContract.lockedSupply();
        const formattedLockedSupply = ethers.utils.formatUnits(lockedSupply, decimals);
        
        // محاسبه توکن‌های قابل توزیع (موجودی قرارداد منهای قفل شده)
        const distributableTokens = parseFloat(formattedContractBalance) - parseFloat(formattedLockedSupply);
        
        // به‌روزرسانی UI
        document.getElementById('distributable-tokens').textContent = `${Math.max(0, distributableTokens).toFixed(2)} PToken`;
        document.getElementById('contract-token-balance').textContent = `${parseFloat(formattedContractBalance).toFixed(2)} PToken`;
        document.getElementById('locked-tokens').textContent = `${parseFloat(formattedLockedSupply).toFixed(2)} PToken`;
        
    } catch (err) {
        console.error('Error fetching distributable tokens:', err);
    }
}

// تابع به‌روزرسانی موجودی استخر ماینر
async function updateMinerPoolBalance() {
    if (!contract) return;

    try {
        // دریافت موجودی استخر ماینر از قرارداد
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
        // دریافت زمان آخرین خرید ماینر
        const lastMinerBuyTime = await contract.lastMinerBuyTime();
        const minerBuyInterval = 24 * 60 * 60; // 24 ساعت به ثانیه
        
        // محاسبه زمان باقی‌مانده
        const currentTime = Math.floor(Date.now() / 1000);
        const nextMinerBuyTime = parseInt(lastMinerBuyTime) + minerBuyInterval;
        const timeRemaining = nextMinerBuyTime - currentTime;
        
        if (timeRemaining > 0) {
            updateMinerTimerDisplay(timeRemaining);
            
            // شروع تایمر
            minerBuyTimer = setInterval(() => {
                const currentTime = Math.floor(Date.now() / 1000);
                const newTimeRemaining = nextMinerBuyTime - currentTime;
                
                if (newTimeRemaining <= 0) {
                    clearInterval(minerBuyTimer);
                    document.getElementById('miner-buy-timer').textContent = 'آماده برای خرید';
                    document.getElementById('buy-miner-btn').disabled = false;
                } else {
                    updateMinerTimerDisplay(newTimeRemaining);
                }
            }, 1000);
        } else {
            document.getElementById('miner-buy-timer').textContent = 'آماده برای خرید';
            document.getElementById('buy-miner-btn').disabled = false;
        }
        
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
    
    // غیرفعال کردن دکمه خرید اگر زمان نرسیده
    document.getElementById('buy-miner-btn').disabled = seconds > 0;
}

// تابع بررسی وضعیت توزیع ماینر
async function checkMinerDistributionStatus() {
    if (!contract) return;

    try {
        // بررسی آیا امروز 5 می‌ماه است
        const today = new Date();
        const isFifthOfMonth = today.getDate() === 5;
        
        const distributionStatusElement = document.getElementById('miner-distribution-status');
        const distributeMinerBtn = document.getElementById('distribute-miner-btn');
        
        if (isFifthOfMonth) {
            distributionStatusElement.textContent = 'امروز 5 می‌ماه است - امکان توزیع وجود دارد';
            distributionStatusElement.style.color = '#10B981';
            distributeMinerBtn.disabled = false;
        } else {
            // محاسبه روزهای باقی‌مانده تا 5 می‌ماه بعد
            const nextFifth = new Date(today);
            if (today.getDate() < 5) {
                nextFifth.setDate(5);
            } else {
                nextFifth.setMonth(today.getMonth() + 1);
                nextFifth.setDate(5);
            }
            
            const daysRemaining = Math.ceil((nextFifth - today) / (1000 * 60 * 60 * 24));
            distributionStatusElement.textContent = `${daysRemaining} روز تا 5 می‌ماه بعد باقی مانده`;
            distributionStatusElement.style.color = '#FF6584';
            distributeMinerBtn.disabled = true;
        }
        
    } catch (err) {
        console.error('Error checking miner distribution status:', err);
    }
}

// تابع خرید توکن ماینر - متصل به قرارداد
async function buyMinerTokens() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال خرید توکن ماینر...', 'info');
        
        // فراخوانی تابع buyMinerTokens در قرارداد
        const tx = await contract.buyMinerTokens({
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('خرید توکن ماینر با موفقیت انجام شد!', 'success');
            await updateMinerStats();
            await updateWalletBalance();
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (err) {
        console.error('Buy miner tokens error:', err);
        
        let errorMessage = 'خطا در خرید: ';
        if (err.code === 'ACTION_REJECTED') {
            errorMessage += 'کاربر تراکنش را رد کرد';
        } else if (err.reason) {
            errorMessage += err.reason;
        } else if (err.message) {
            errorMessage += err.message;
        } else {
            errorMessage += 'خطای ناشناخته';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// تابع توزیع توکن ماینر - با بررسی تاریخ
async function distributeMinerTokens() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    // بررسی آیا امروز 5 می‌ماه است
    const today = new Date();
    if (today.getDate() !== 5) {
        showMessage('امکان توزیع فقط در تاریخ 5 هر ماه وجود دارد', 'error');
        return;
    }

    try {
        showMessage('در حال توزیع توکن ماینر...', 'info');
        
        // فراخوانی تابع distributeMinerTokens در قرارداد
        const tx = await contract.distributeMinerTokens({
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('توزیع توکن ماینر با موفقیت انجام شد!', 'success');
            await updateMinerStats();
            await updateWalletBalance();
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (err) {
        console.error('Distribute miner tokens error:', err);
        
        let errorMessage = 'خطا در توزیع: ';
        if (err.code === 'ACTION_REJECTED') {
            errorMessage += 'کاربر تراکنش را رد کرد';
        } else if (err.reason) {
            errorMessage += err.reason;
        } else if (err.message) {
            errorMessage += err.message;
        } else {
            errorMessage += 'خطای ناشناخته';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// تابع به‌روزرسانی اطلاعات برداشت استخر پاداش توسعه
async function updateWithdrawInfo() {
    if (!contract || !userAccount) return;

    try {
        const user = await contract.getUserInfo(userAccount);
        const poolBalance = await contract.poolBalance();
        
        // به‌روزرسانی استخر پاداش توسعه
        const poolBalanceMatic = ethers.utils.formatEther(poolBalance);
        document.getElementById('pool-balance').textContent = parseFloat(poolBalanceMatic).toFixed(4);
        document.getElementById('pool-amount').textContent = parseFloat(poolBalanceMatic).toFixed(4);
        
        // تعداد تعادل‌های استخر
        document.getElementById('pool-balance-count').textContent = user.balanceCount.toString();
        
        // تعداد ثبت‌نام‌های استخر
        try {
            const totalUsers = await contract.totalUsers();
            document.getElementById('pool-registrations').textContent = totalUsers.toString();
        } catch (err) {
            console.log('totalUsers function not available');
        }
        
        // محاسبه ارزش هر پوینت
        const balanceCount = parseInt(user.balanceCount);
        if (balanceCount > 0 && parseFloat(poolBalanceMatic) > 0) {
            const valuePerPoint = parseFloat(poolBalanceMatic) / balanceCount;
            document.getElementById('value-per-point').textContent = `${valuePerPoint.toFixed(6)} پالیگان`;
        } else {
            document.getElementById('value-per-point').textContent = '0 پالیگان';
        }
        
        // به‌روزرسانی اطلاعات استخر ویژه
        await updateSpecialPoolInfo();
        
        // به‌روزرسانی تایمر برداشت
        await startWithdrawTimer();
        
    } catch (err) {
        console.error('Error fetching withdraw info:', err);
    }
}

// تابع به‌روزرسانی اطلاعات استخر ویژه
async function updateSpecialPoolInfo() {
    if (!contract || !userAccount) return;

    try {
        const user = await contract.getUserInfo(userAccount);
        
        // دریافت اطلاعات استخر ویژه از قرارداد
        const specialPoolBalance = await contract.specialRewardPool();
        const specialPoolCount = await contract.getSpecialPoolCount();
        
        const specialPoolBalanceMatic = ethers.utils.formatEther(specialPoolBalance);
        
        // به‌روزرسانی UI
        document.getElementById('special-pool-balance').textContent = parseFloat(specialPoolBalanceMatic).toFixed(4);
        document.getElementById('special-pool-count').textContent = specialPoolCount.toString();
        document.getElementById('special-amount').textContent = parseFloat(specialPoolBalanceMatic).toFixed(4);
        
        // تعداد امتیازهای ویژه کاربر
        document.getElementById('user-special-balance').textContent = user.specialBalanceCount.toString();
        
        // محاسبه ارزش هر امتیاز ویژه
        const specialCount = parseInt(specialPoolCount);
        if (specialCount > 0 && parseFloat(specialPoolBalanceMatic) > 0) {
            const valuePerSpecialPoint = parseFloat(specialPoolBalanceMatic) / specialCount;
            document.getElementById('value-per-special-point').textContent = `${valuePerSpecialPoint.toFixed(6)} پالیگان`;
        } else {
            document.getElementById('value-per-special-point').textContent = '0 پالیگان';
        }
        
        // محاسبه سهم کاربر از استخر ویژه
        const userSpecialBalance = parseInt(user.specialBalanceCount);
        if (userSpecialBalance > 0 && parseFloat(specialPoolBalanceMatic) > 0 && specialCount > 0) {
            const userShare = (userSpecialBalance / specialCount) * parseFloat(specialPoolBalanceMatic);
            document.getElementById('user-special-share').textContent = `${userShare.toFixed(6)} پالیگان`;
        } else {
            document.getElementById('user-special-share').textContent = '0 پالیگان';
        }
        
    } catch (err) {
        console.error('Error fetching special pool info:', err);
        // اگر توابع ویژه وجود نداشت، از اطلاعات کاربر استفاده کن
        document.getElementById('special-pool-balance').textContent = '0';
        document.getElementById('special-pool-count').textContent = user.specialBalanceCount.toString();
        document.getElementById('special-amount').textContent = '0';
    }
}

// تابع شروع تایمر برداشت - هماهنگ با قرارداد
async function startWithdrawTimer() {
    if (!contract || !userAccount) return;

    try {
        // دریافت زمان آخرین برداشت از قرارداد
        const lastWithdrawTime = await contract.lastPoolWithdrawTime();
        const withdrawInterval = 6 * 60 * 60; // 6 ساعت به ثانیه
        
        // محاسبه زمان باقی‌مانده
        const currentTime = Math.floor(Date.now() / 1000);
        const nextWithdrawTime = parseInt(lastWithdrawTime) + withdrawInterval;
        const timeRemaining = nextWithdrawTime - currentTime;
        
        if (timeRemaining > 0) {
            updateWithdrawTimerDisplay(timeRemaining);
            withdrawTimer = setInterval(() => {
                const currentTime = Math.floor(Date.now() / 1000);
                const newTimeRemaining = nextWithdrawTime - currentTime;
                
                if (newTimeRemaining <= 0) {
                    clearInterval(withdrawTimer);
                    document.getElementById('countdown-timer').textContent = 'آماده برای برداشت';
                    document.getElementById('pool-withdraw-btn').disabled = false;
                    document.getElementById('special-withdraw-btn').disabled = false;
                } else {
                    updateWithdrawTimerDisplay(newTimeRemaining);
                }
            }, 1000);
        } else {
            document.getElementById('countdown-timer').textContent = 'آماده برای برداشت';
            document.getElementById('pool-withdraw-btn').disabled = false;
            document.getElementById('special-withdraw-btn').disabled = false;
        }
        
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
    
    // غیرفعال کردن دکمه برداشت اگر زمان نرسیده
    document.getElementById('pool-withdraw-btn').disabled = seconds > 0;
    document.getElementById('special-withdraw-btn').disabled = seconds > 0;
}

// تابع برداشت از استخر پاداش توسعه - متصل به قرارداد
async function withdrawPool() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال برداشت از استخر پاداش توسعه...', 'info');
        
        // فراخوانی تابع withdrawPool در قرارداد
        const tx = await contract.withdrawPool({
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('برداشت با موفقیت انجام شد!', 'success');
            await updateWithdrawInfo();
            await updateWalletBalance();
            await startWithdrawTimer();
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (err) {
        console.error('Withdraw pool error:', err);
        
        let errorMessage = 'خطا در برداشت: ';
        if (err.code === 'ACTION_REJECTED') {
            errorMessage += 'کاربر تراکنش را رد کرد';
        } else if (err.reason) {
            errorMessage += err.reason;
        } else if (err.message) {
            errorMessage += err.message;
        } else {
            errorMessage += 'خطای ناشناخته';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// تابع برداشت از استخر پاداش ویژه - متصل به قرارداد
async function withdrawSpecials() {
    if (!contract || !userAccount) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال برداشت از استخر پاداش ویژه...', 'info');
        
        // فراخوانی تابع withdrawSpecials در قرارداد
        const tx = await contract.withdrawSpecials({
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد - در انتظار تایید...', 'info');
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showMessage('برداشت ویژه با موفقیت انجام شد!', 'success');
            await updateWithdrawInfo();
            await updateWalletBalance();
            await startWithdrawTimer();
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (err) {
        console.error('Withdraw specials error:', err);
        
        let errorMessage = 'خطا در برداشت ویژه: ';
        if (err.code === 'ACTION_REJECTED') {
            errorMessage += 'کاربر تراکنش را رد کرد';
        } else if (err.reason) {
            errorMessage += err.reason;
        } else if (err.message) {
            errorMessage += err.message;
        } else {
            errorMessage += 'خطای ناشناخته';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// تابع به‌روزرسانی موجودی کیف پول
async function updateWalletBalance() {
    if (!provider || !userAccount) return;

    try {
        const balance = await provider.getBalance(userAccount);
        const balanceInMatic = ethers.utils.formatEther(balance);
        
        // به‌روزرسانی موجودی در تمام بخش‌ها
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

// رویدادهای ورودی برای محاسبه بلادرنگ
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
        
        // بررسی اتصال خودکار اگر کیف پول قبلاً متصل بوده
        if (window.ethereum.selectedAddress) {
            setTimeout(connectWallet, 1000);
        }
    }
});