// تنظیمات DApp
const CONFIG = {
    CONTRACT_ADDRESS: "0x166dd205590240c90ca4e0e545ad69db47d8f22f",
    TOKEN_P_CONTRACT_ADDRESS: "0x82F7dBe1792436d15bdA22bB3340bD3f45D614Fa"
};

// ABI ساده‌شده
const CONTRACT_ABI = [
    "function register(uint256 uplineCode, bool placeOnLeft) payable",
    "function buyMinerTokens()",
    "function distributeMinerTokens()",
    "function withdrawPool()",
    "function withdrawSpecials()",
    "function getUserInfo(address user) view returns (uint256 id, uint256 uplineId, uint256 leftCount, uint256 rightCount, uint256 balanceCount, uint256 specialBalanceCount, uint256 totalMinerRewards, bool isMiner)",
    "function poolBalance() view returns (uint256)",
    "function minerTokenPool() view returns (uint256)",
    "function lastMinerBuyTime() view returns (uint256)",
    "function lastPoolWithdrawTime() view returns (uint256)",
    "function specialRewardPool() view returns (uint256)",
    "function getSpecialPoolCount() view returns (uint256)",
    "function registrationFee() view returns (uint256)",
    "function totalUsers() view returns (uint256)"
];

const TOKEN_P_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function buyPToken() payable",
    "function getPTokenPriceInWei() view returns (uint256)",
    "function sellPToken(uint256 pTokenAmount)",
    "function decimals() view returns (uint8)"
];

// متغیرهای گلوبال
let provider = null;
let signer = null;
let contract = null;
let tokenPContract = null;
let userAccount = null;
let isConnected = false;

// کش ساده
const cache = {
    userInfo: null,
    pTokenInfo: null,
    lastUpdate: 0
};

// تابع اصلی اتصال
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showMessage('لطفاً MetaMask را نصب کنید', 'error');
            return;
        }

        showMessage('در حال اتصال...', 'info');
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length === 0) {
            throw new Error('هیچ حسابی پیدا نشد');
        }

        signer = provider.getSigner();
        userAccount = accounts[0];
        
        // ایجاد قراردادها
        contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        tokenPContract = new ethers.Contract(CONFIG.TOKEN_P_CONTRACT_ADDRESS, TOKEN_P_ABI, signer);
        
        isConnected = true;
        updateUIAfterConnection();
        await loadEssentialData();
        
        showMessage('اتصال موفقیت‌آمیز!', 'success');
        
    } catch (err) {
        console.error('Connection error:', err);
        showMessage('خطا در اتصال: ' + (err.message || err), 'error');
        resetConnection();
    }
}

// بارگذاری داده‌های ضروری
async function loadEssentialData() {
    if (!isConnected) return;
    
    try {
        await updateWalletBalance();
        await checkRegistrationStatus();
    } catch (err) {
        console.error('Error loading essential data:', err);
    }
}

// بارگذاری داده‌های تب جاری
async function loadCurrentTabData() {
    if (!isConnected) return;
    
    const activeTab = document.querySelector('.tab-content.active').id;
    
    switch(activeTab) {
        case 'user-tab':
            await loadUserInfo();
            break;
        case 'token-p-tab':
            await loadTokenInfo();
            break;
        case 'miner-tab':
            await loadMinerInfo();
            break;
        case 'withdraw-tab':
            await loadWithdrawInfo();
            break;
    }
}

// به‌روزرسانی UI پس از اتصال
function updateUIAfterConnection() {
    const accountDisplay = document.getElementById('account');
    const accountAddress = document.querySelector('.account-address');
    
    accountAddress.textContent = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
    accountDisplay.style.display = 'block';
    
    document.getElementById('connect-btn').style.display = 'none';
    document.getElementById('disconnect-btn').style.display = 'flex';
}

// قطع اتصال
function disconnectWallet() {
    resetConnection();
    showMessage('اتصال قطع شد', 'info');
}

function resetConnection() {
    provider = null;
    signer = null;
    contract = null;
    tokenPContract = null;
    userAccount = null;
    isConnected = false;
    
    document.getElementById('account').style.display = 'none';
    document.getElementById('connect-btn').style.display = 'flex';
    document.getElementById('disconnect-btn').style.display = 'none';
    document.getElementById('unregistered-view').style.display = 'block';
    document.getElementById('registered-view').style.display = 'none';
    
    // ریست داده‌ها
    cache.userInfo = null;
    cache.pTokenInfo = null;
}

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
    event.currentTarget.classList.add('active');
    
    // بارگذاری داده‌های مربوطه
    if (isConnected) {
        loadCurrentTabData();
    }
}

// بررسی وضعیت ثبت‌نام
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
            cache.userInfo = user;
            updateUserUI(user);
        }
    } catch (err) {
        console.error('Error checking registration:', err);
        document.getElementById('unregistered-view').style.display = 'block';
        document.getElementById('registered-view').style.display = 'none';
    }
}

// ثبت‌نام
async function register() {
    if (!isConnected) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    const uplineCodeInput = document.getElementById('upline-address');
    const uplineCode = uplineCodeInput.value.trim();
    const placeOnLeft = document.querySelector('input[name="place"]:checked').value === 'left';

    if (!uplineCode) {
        showMessage('لطفاً شناسه آپلاین وارد کنید', 'error');
        return;
    }

    const uplineCodeNumber = parseInt(uplineCode);
    if (isNaN(uplineCodeNumber) || uplineCodeNumber <= 0) {
        showMessage('شناسه آپلاین باید عدد مثبت باشد', 'error');
        return;
    }

    try {
        showMessage('در حال ثبت‌نام...', 'info');
        
        const registrationFee = await contract.registrationFee();
        
        const tx = await contract.register(uplineCodeNumber, placeOnLeft, {
            value: registrationFee,
            gasLimit: 500000
        });

        showMessage('تراکنش ارسال شد...', 'info');
        await tx.wait();
        
        showMessage('ثبت‌نام موفقیت‌آمیز!', 'success');
        await checkRegistrationStatus();
        uplineCodeInput.value = '';
        
    } catch (err) {
        console.error('Registration error:', err);
        showMessage('خطا در ثبت‌نام: ' + (err.reason || err.message), 'error');
    }
}

// بارگذاری اطلاعات کاربر
async function loadUserInfo() {
    if (!contract || !userAccount) return;

    try {
        const user = cache.userInfo || await contract.getUserInfo(userAccount);
        cache.userInfo = user;
        updateUserUI(user);
        
    } catch (err) {
        console.error('Error loading user info:', err);
        showMessage('خطا در دریافت اطلاعات کاربر', 'error');
    }
}

// به‌روزرسانی UI کاربر
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
    
    // قیمت ورود
    const entryPrice = user.entryPrice ? ethers.utils.formatEther(user.entryPrice) : '0';
    document.getElementById('entry-price').textContent = `${parseFloat(entryPrice).toFixed(2)} پالیگان`;
}

// بارگذاری اطلاعات توکن
async function loadTokenInfo() {
    await Promise.all([
        updatePTokenInfo(),
        updateWalletBalance()
    ]);
}

// به‌روزرسانی اطلاعات توکن P
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
    }
}

// محاسبه تعداد توکن‌های قابل خرید
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
    }
}

// محاسبه مقدار پالیگان قابل دریافت از فروش
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
    }
}

// خرید توکن P
async function buyPTokens() {
    if (!isConnected) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    const buyAmount = document.getElementById('buy-amount').value;
    
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
        showMessage('لطفاً مقدار معتبر وارد کنید', 'error');
        return;
    }

    try {
        showMessage('در حال خرید...', 'info');
        
        const amountInWei = ethers.utils.parseEther(buyAmount);
        const tx = await tokenPContract.buyPToken({
            value: amountInWei,
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد...', 'info');
        await tx.wait();
        
        showMessage('خرید موفقیت‌آمیز!', 'success');
        await updatePTokenInfo();
        await updateWalletBalance();
        document.getElementById('buy-amount').value = '';
        document.getElementById('tokens-received').textContent = '0 توکن P';
        
    } catch (err) {
        console.error('Buy PToken error:', err);
        showMessage('خطا در خرید: ' + (err.reason || err.message), 'error');
    }
}

// فروش توکن P
async function sellPTokens() {
    if (!isConnected) {
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

        showMessage('در حال فروش...', 'info');
        
        const tokenAmount = ethers.utils.parseUnits(sellAmount, decimals);
        const tx = await tokenPContract.sellPToken(tokenAmount, {
            gasLimit: 300000
        });
        
        showMessage('تراکنش ارسال شد...', 'info');
        await tx.wait();
        
        showMessage('فروش موفقیت‌آمیز!', 'success');
        await updatePTokenInfo();
        await updateWalletBalance();
        document.getElementById('sell-amount').value = '';
        document.getElementById('matic-received').textContent = '0 پالیگان';
        
    } catch (err) {
        console.error('Sell PToken error:', err);
        showMessage('خطا در فروش: ' + (err.reason || err.message), 'error');
    }
}

// بارگذاری اطلاعات ماینر
async function loadMinerInfo() {
    if (!contract || !userAccount) return;

    try {
        const user = cache.userInfo || await contract.getUserInfo(userAccount);
        updateMinerUI(user);
        
        await updateMinerPoolBalance();
        
    } catch (err) {
        console.error('Error loading miner info:', err);
    }
}

// به‌روزرسانی UI ماینر
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
    document.getElementById('miner-total-rewards').textContent = `${parseFloat(minerRewards).toFixed(4)} PToken`;
}

// به‌روزرسانی موجودی استخر ماینر
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

// خرید توکن ماینر
async function buyMinerTokens() {
    if (!isConnected) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال خرید توکن ماینر...', 'info');
        
        const tx = await contract.buyMinerTokens({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('خرید موفقیت‌آمیز!', 'success');
        await loadMinerInfo();
        await updateWalletBalance();
        
    } catch (err) {
        console.error('Buy miner tokens error:', err);
        showMessage('خطا در خرید: ' + (err.reason || err.message), 'error');
    }
}

// توزیع توکن ماینر
async function distributeMinerTokens() {
    if (!isConnected) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال توزیع توکن ماینر...', 'info');
        
        const tx = await contract.distributeMinerTokens({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('توزیع موفقیت‌آمیز!', 'success');
        await loadMinerInfo();
        await updateWalletBalance();
        
    } catch (err) {
        console.error('Distribute miner tokens error:', err);
        showMessage('خطا در توزیع: ' + (err.reason || err.message), 'error');
    }
}

// بارگذاری اطلاعات برداشت
async function loadWithdrawInfo() {
    if (!contract || !userAccount) return;

    try {
        const [user, poolBalance, specialPoolBalance, specialPoolCount, totalUsers] = await Promise.all([
            cache.userInfo || contract.getUserInfo(userAccount),
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

// برداشت از استخر پاداش توسعه
async function withdrawPool() {
    if (!isConnected) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال برداشت...', 'info');
        
        const tx = await contract.withdrawPool({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('برداشت موفقیت‌آمیز!', 'success');
        await loadWithdrawInfo();
        await updateWalletBalance();
        
    } catch (err) {
        console.error('Withdraw pool error:', err);
        showMessage('خطا در برداشت: ' + (err.reason || err.message), 'error');
    }
}

// برداشت از استخر پاداش ویژه
async function withdrawSpecials() {
    if (!isConnected) {
        showMessage('لطفاً ابتدا به کیف پول متصل شوید', 'error');
        return;
    }

    try {
        showMessage('در حال برداشت ویژه...', 'info');
        
        const tx = await contract.withdrawSpecials({
            gasLimit: 300000
        });
        
        await tx.wait();
        
        showMessage('برداشت ویژه موفقیت‌آمیز!', 'success');
        await loadWithdrawInfo();
        await updateWalletBalance();
        
    } catch (err) {
        console.error('Withdraw specials error:', err);
        showMessage('خطا در برداشت ویژه: ' + (err.reason || err.message), 'error');
    }
}

// به‌روزرسانی موجودی کیف پول
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

// نمایش پیام
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `message-toast ${type}`;
    messageElement.classList.add('show');
    
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 4000);
}

// رویدادهای صفحه
document.addEventListener('DOMContentLoaded', function() {
    // محاسبه بلادرنگ
    document.getElementById('buy-amount').addEventListener('input', calculateBuyTokens);
    document.getElementById('sell-amount').addEventListener('input', calculateSellMatic);
    
    // بررسی تغییر حساب
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function(accounts) {
            if (accounts.length === 0) {
                resetConnection();
            } else {
                connectWallet();
            }
        });
        
        window.ethereum.on('chainChanged', function() {
            window.location.reload();
        });
        
        // اتصال خودکار اگر از قبل متصل است
        if (window.ethereum.selectedAddress) {
            setTimeout(connectWallet, 500);
        }
    }
});