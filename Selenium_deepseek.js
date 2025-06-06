const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const clipboard = require('clipboard');

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--start-maximized');
chromeOptions.excludeSwitches(['enable-automation']);
chromeOptions.setUserPreferences({ 'credentials_enable_service': false });

// Đường dẫn cố định cho profile tạm
const tempProfile = `E:\\Fantasy\\Fantasy1\\TempProfiles\\profile_${Date.now()}`;
chromeOptions.addArguments(`--user-data-dir=${tempProfile}`);
console.log(`📁 Sử dụng profile tạm: ${tempProfile}`);

chromeOptions.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=9222');

// Đọc email và mật khẩu từ file mail.txt
const [email, password] = fs.readFileSync('mail.txt', 'utf8').trim().split('|');

// Các hành động kiểm tra động
const actions = [
  { name: "Register and Play for free", locator: By.xpath("//button[contains(text(), 'Register and Play for free')]"), delay: 3000 },
  { name: "Đăng nhập Google", locator: By.xpath("//button[contains(@class, 'login-method-button')]"), delay: 3000 },
  { name: "Retry", locator: By.xpath("//button[contains(@class, 'sc-jUkaYT sc-jHswkR ooyiq dovXzJ') and contains(text(), 'Retry')]"), delay: 3000, refresh: true },
  { name: "Continue - Google", locator: By.xpath("//button[contains(@class, 'sc-jUkaYT sc-jHswkR ooyiq dovXzJ') and contains(text(), 'Continue')]"), delay: 2000, postDelay: 3000 },
  { name: "Click tài khoản Google", locator: By.xpath(`//div[@data-email='${email}']`), delay: 1000 },
  { name: "Continue - Span", locator: By.xpath("//span[contains(@class, 'VfPpkd-vQzf8d') and contains(text(), 'Continue')]"), delay: 1000, postDelay: 10000 },
  { name: "Continue - Button", locator: By.xpath("//button[contains(@class, 'ring-1 ring-inset shadow-inner shadow-[rgba(24') and contains(text(), 'Continue')]"), delay: 1000, repeat: true },
  { name: "Claim 100 $fMON", locator: By.xpath("//button[contains(@class, 'ring-1 ring-inset shadow-inner shadow-[rgba') and contains(text(), 'Claim 100 $fMON')]"), delay: 3000, postDelay: 10000 },
  { name: "Phát hiện Open Pack", locator: By.xpath("//button[contains(@class, 'ring-1 ring-inset shadow-inner shadow-[rgba') and contains(text(), 'Open Pack')]"), delay: 2000, postDelay: 10000 },
  { name: "Error Message Refresh", locator: By.xpath("//p[contains(text(), 'We're having trouble processing your request for now, come back in a few minutes. You can check the rest of the app while you wait.')]"), delay: 2000, refresh: true },
  {
    name: "Phát hiện Url Pack",
    checkUrl: "monad.fantasy.top/open-pack-rive",
    delay: 3000,
    postDelay: 5000,
    customAction: async (driver, action) => { // Thêm tham số action
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes(action.checkUrl)) { // Sử dụng action.checkUrl
        console.log(`🌐 Phát hiện URL: ${currentUrl}`);
        console.log(`⏳ Chờ ${action.delay / 1000} giây trước khi thực hiện.`);
        await driver.sleep(action.delay);

        // Quay lại trang chính
        await driver.navigate().back();
        console.log("🔄 Quay lại trang chính...");

        console.log(`⏳ Chờ ${action.postDelay / 1000} giây sau khi quay lại.`);
        await driver.sleep(action.postDelay);
      }
    }
  },
  { name: "Phát hiện Bronze", locator: By.xpath("//span[contains(@class, 'font-extrabold text-lg sm:text-x') and contains(text(), 'bronze')]"), delay: 2000, postDelay: 5000, customAction: async (driver) => {
    const { width, height } = await driver.manage().window().getRect();
    const x = width * (2 / 3);
    const y = height / 2;
    const actions = driver.actions({ bridge: true });
    await actions.move({ x: parseInt(x), y: parseInt(y) }).click().perform();
  }},
  { name: "Phát hiện Profile", locator: [ By.xpath("//span[contains(@class, 'text-white font-normal text-sm sm:text-base max-w-[110px] w-full sm:max-w-[110px] truncate')]")], delay: 2000, postDelay: 2000 },
  { name: "Phát hiện Continue - Profile", locator: By.xpath("//button[contains(@class, 'ring-1') and contains(@class, 'bg-neon') and contains(text(), 'Continue')]"), delay: 2000, postDelay: 2000 },
  { name: "Phát hiện Settings", locator: By.xpath("//button[contains(text(), 'Settings')]"), delay: 2000, postDelay: 5000 },
  { name: "Phát hiện Export Wallet", locator: By.xpath("//button[contains(text(), 'Export Wallet')]"), delay: 2000, postDelay: 5000,
    customAction: async (driver) => {
      try {
        // Click vào Export Wallet
        const exportWalletButton = await driver.findElement(this.locator);
        await exportWalletButton.click();
        console.log("✅ Đã click vào Export Wallet");

        // Chờ cửa sổ popup xuất hiện
        console.log("⏳ Chờ cửa sổ popup chứa Copy Key xuất hiện...");
        await driver.sleep(3000); // Chờ 3 giây để cửa sổ popup hiển thị

        // Tạm dừng quét Export Wallet để tránh click lại
        this.isCompleted = true; // Đánh dấu hành động này đã hoàn thành
      } catch (error) {
        console.log(`⏩ Lỗi khi thực hiện Export Wallet: ${error.message}`);
      }
    }
  },
  {
    name: "Phát hiện Copy Key",
    locator: By.xpath("//button[contains(text(), 'Copy Key')]"),
    delay: 2000,
    postDelay: 2000,
    customAction: async (driver) => {
      try {
        // Click vào Copy Key để sao chép chuỗi ký tự vào clipboard
        const copyKeyButton = await driver.findElement(this.locator);
        await copyKeyButton.click();
        console.log("✅ Đã click vào Copy Key");

        // Chờ một chút để đảm bảo chuỗi ký tự đã được sao chép vào clipboard
        await driver.sleep(1000);

        // Đọc nội dung từ clipboard
        const clipboardContent = await clipboardy.read();
        console.log("📋 Nội dung từ clipboard:", clipboardContent);

        // Lưu nội dung vào file txt
        const filePath = "copied_key.txt"; // Đường dẫn file txt
        fs.writeFileSync(filePath, clipboardContent);
        console.log(`✅ Đã lưu nội dung vào file: ${filePath}`);

        // Đóng cửa sổ popup (nếu cần)
        const closePopupButton = await driver.findElement(By.xpath("//button[contains(text(), 'Close') or contains(@class, 'close-button')]"));
        if (closePopupButton) {
          await closePopupButton.click();
          console.log("✅ Đã đóng cửa sổ popup");
        }
      } catch (error) {
        console.log(`⏩ Lỗi khi thực hiện Copy Key: ${error.message}`);
      }
    }
  },
];

async function executeDynamicActions(driver) {
  console.log("🔍 Bắt đầu quét và thực thi hành động...");

  let retries = 0;
  const maxRetries = 100; // Giới hạn số lần kiểm tra lại

  while (retries < maxRetries) {
    let actionFound = false;

    // Tìm tất cả các hành động khả dụng đồng thời
    const results = await Promise.all(actions.map(async (action) => {
      try {
        const elements = await driver.findElements(action.locator);

        // Nếu tìm thấy phần tử
        if (elements.length > 0) {
          console.log(`✅ Tìm thấy ${elements.length} phần tử: ${action.name}`);

          // Chờ trước khi thực hiện (nếu có delay)
          if (action.delay) {
            console.log(`⏳ Chờ ${action.delay / 1000} giây trước khi thực hiện.`);
            await driver.sleep(action.delay);
          }

          // Nếu là hành động yêu cầu refresh (ví dụ: Retry)
          if (action.refresh) {
            console.log("🔄 Phát hiện lỗi, làm mới trang...");
            await driver.navigate().refresh();
            await driver.sleep(3000); // Chờ trang tải lại
            return true;
          }

          // Nếu là hành động lặp lại (repeat: true) → Click tất cả
          if (action.repeat) {
            for (let i = 0; i < elements.length; i++) {
              await elements[i].click();
              console.log(`🔁 Đã click lần ${i + 1}: ${action.name}`);

              // Chờ sau mỗi lần click (nếu có postDelay)
              if (action.postDelay) {
                console.log(`⏳ Chờ ${action.postDelay / 1000} giây sau khi click.`);
                await driver.sleep(action.postDelay);
              }
            }
          } else {
            // Click hành động thông thường (chỉ click 1 lần)
            await elements[0].click();
            console.log(`✅ Đã click: ${action.name}`);
          }

          // Chờ sau hành động (nếu cần postDelay)
          if (action.postDelay) {
            console.log(`⏳ Chờ ${action.postDelay / 1000} giây sau khi hoàn tất.`);
            await driver.sleep(action.postDelay);
          }

          // Thực hiện hành động tùy chỉnh nếu có
          if (action.customAction) {
            await action.customAction(driver);
          }

          return true; // Đánh dấu đã thực hiện thành công
        }
      } catch (error) {
        console.log(`⏩ Lỗi khi thực hiện: ${action.name} - ${error.message}`);
      }

      return false; // Không tìm thấy hành động
    }));

    // Nếu tìm thấy ít nhất 1 hành động thành công, reset bộ đếm
    if (results.includes(true)) {
      retries = 0;
      actionFound = true;
    } else {
      retries++;
      console.log(`🔎 Không tìm thấy hành động nào. Thử lại (${retries}/${maxRetries})...`);
    }

    // Kết thúc nếu đạt số lần kiểm tra tối đa
    if (retries >= maxRetries) {
      console.log("🎉 Không còn hành động nào cần thực hiện!");
      break;
    }

    // Chờ ngắn giữa các lần kiểm tra (tăng tốc độ quét)
    if (!actionFound) {
      await driver.sleep(200); // Kiểm tra lại nhanh hơn
    }
  }
}


async function loginToGmailAndMonad() {
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();

  const safeClick = async (locator, timeout = 5000) => {
    try {
      const element = await driver.wait(until.elementLocated(locator), timeout);
      await driver.wait(until.elementIsVisible(element), timeout);
      await driver.wait(until.elementIsEnabled(element), timeout);
      await element.click();
      console.log(`✅ Click thành công: ${locator}`);
    } catch (error) {
      console.log(`⏩ Không thể click: ${locator}`);
    }
  };

  const navigateTo = async (url) => {
    try {
      await driver.get(url);
      console.log(`🌐 Điều hướng đến: ${url}`);
    } catch (error) {
      console.error(`❌ Lỗi khi điều hướng: ${url}`, error);
    }
  };

  try {
    await navigateTo('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ifkv=ASSHykpZuzEscfPr1eoRQ2Bf4RQ7UHGLPi8aKOL90IRKCalGFDDqwpQY4HMh5le2U87r2uzhGwtH&rip=1&sacu=1&service=mail&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S2099664190%3A1741137214232925&ddm=1');

    console.log("✉️ Nhập email...");
    await driver.findElement(By.id('identifierId')).sendKeys(email);
    await safeClick(By.id('identifierNext'));

    console.log("🔑 Chờ ô mật khẩu...");
    let passwordInput = await driver.wait(until.elementLocated(By.name('Passwd')), 15000);
    await driver.wait(until.elementIsVisible(passwordInput), 5000);

    console.log("🔒 Nhập mật khẩu...");
    await passwordInput.sendKeys(password);
    await safeClick(By.id('passwordNext'));

    console.log("📜 Kiểm tra 'Tôi hiểu'...");
    await safeClick(By.id('confirm'));

    console.log("🔄 Kiểm tra 'Do this later' hoặc 'Làm điều này sau'...");
    await safeClick(By.xpath("//a[contains(text(), 'Do this later') or contains(text(), 'Thực hiện sau')]"));

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('mail.google.com') || url.includes('myaccount.google.com');
    }, 20000)
    console.log("✅ Đăng nhập Gmail thành công!");

    console.log("🌍 Điều hướng đến Monad Fantasy...");
    await navigateTo('https://monad.fantasy.top/');

    // Kiểm tra động tất cả các bước không theo thứ tự
    await executeDynamicActions(driver);

    console.log("🔄 Refresh lại trang...");
    await driver.sleep(3000);

    console.log("✅ Quá trình hoàn tất!");
  } catch (error) {
    console.error("❌ Lỗi chung:", error);
  } finally {
    // Không tự động đóng trình duyệt để kiểm tra kết quả
    // await driver.quit();
  }
}

loginToGmailAndMonad();
