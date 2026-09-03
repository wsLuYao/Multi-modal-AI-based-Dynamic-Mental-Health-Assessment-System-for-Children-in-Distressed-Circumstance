// 预设账号信息
const validEmail = "testing@ccnu.edu.cn";
const validPassword = "123456";

// 监听表单提交
document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault(); // 阻止表单默认提交

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email === validEmail && password === validPassword) {
    // 显示进度条
    const overlay = document.getElementById("loadingOverlay");
    const progressFill = document.getElementById("progressFill");

    overlay.style.display = "flex";

    // 延迟一点点触发动画
    setTimeout(() => {
      progressFill.style.width = "100%";
    }, 100);

    // 2s 后跳转页面
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2100);
  } else {
    alert("账号未注册，请先注册账号");
  }
});

/* 打字机循环效果 */
const texts = [
    "用AI守护困境儿童的心理健康",
  "基于多模态人工智能感知的困境儿童心理健康动态评估数据库系统",
  "通过元分析构建核心数据库",
  "Never start from scratch!"
];

let textIndex = 0;
let charIndex = 0;
const typingText = document.getElementById("typingText");
const cursor = document.getElementById("cursor");
const typingSpeed = 100;  // 打字速度
const erasingSpeed = 50;  // 删除速度
const delayBetween = 1200; // 完整显示后的停留时间

function typeEffect() {
  if (charIndex < texts[textIndex].length) {
    typingText.textContent += texts[textIndex].charAt(charIndex);
    charIndex++;
    setTimeout(typeEffect, typingSpeed);
  } else {
    setTimeout(eraseEffect, delayBetween);
  }
}

function eraseEffect() {
  if (charIndex > 0) {
    typingText.textContent = texts[textIndex].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseEffect, erasingSpeed);
  } else {
    textIndex = (textIndex + 1) % texts.length;
    setTimeout(typeEffect, typingSpeed);
  }
}

// 页面加载后启动打字效果
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(typeEffect, 500);
});