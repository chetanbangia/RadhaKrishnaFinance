// --- 1. Mobile Menu ---
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

mobileMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    navMenu.classList.remove('active');
    mobileMenu.classList.remove('active');
}));

// --- 2. Chart & Calculator ---
let mode = 'sip';
let myChart = null;
const ctx = document.getElementById('myChart').getContext('2d');

const inputs = {
    invest: { range: document.getElementById('investRange'), num: document.getElementById('investInput') },
    rate: { range: document.getElementById('rateRange'), num: document.getElementById('rateInput') },
    time: { range: document.getElementById('timeRange'), num: document.getElementById('timeInput') }
};

function initChart() {
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Invested', 'Profit'],
            datasets: [{
                data: [50, 50],
                backgroundColor: ['#e0e0e0', '#FF9900'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: '75%',
            animation: { animateScale: true, animateRotate: true }
        }
    });
}

function updateChart(invested, profit) {
    if(myChart) {
        myChart.data.datasets[0].data = [invested, profit];
        myChart.update();
    }
}

Object.values(inputs).forEach(({range, num}) => {
    range.addEventListener('input', () => { num.value = range.value; calculate(); });
    num.addEventListener('input', () => { range.value = num.value; calculate(); });
});

window.setMode = (selectedMode) => {
    mode = selectedMode;
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    if(mode === 'lumpsum') {
        inputs.invest.range.max = 5000000;
        if(inputs.invest.num.value < 5000) { inputs.invest.num.value = 50000; inputs.invest.range.value = 50000; }
    } else {
        inputs.invest.range.max = 100000;
    }
    calculate();
};

function calculate() {
    const P = parseFloat(inputs.invest.num.value) || 0;
    const R = parseFloat(inputs.rate.num.value) || 0;
    const T = parseFloat(inputs.time.num.value) || 0;
    let invested = 0, total = 0;

    if (mode === 'sip') {
        const i = (R / 100) / 12;
        const n = T * 12;
        invested = P * n;
        total = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    } else {
        invested = P;
        total = P * Math.pow((1 + R / 100), T);
    }
    const profit = total - invested;
    document.getElementById('investedAmount').innerText = '₹ ' + Math.round(invested).toLocaleString('en-IN');
    document.getElementById('estReturns').innerText = '₹ ' + Math.round(profit).toLocaleString('en-IN');
    document.getElementById('totalValue').innerText = '₹ ' + Math.round(total).toLocaleString('en-IN');
    updateChart(invested, profit);
}

// --- 3. Animations: Typewriter, Counter ---
const typeElement = document.querySelector('.typewriter-text');
const textToType = typeElement.getAttribute('data-text');
let typeIndex = 0;

function typeWriter() {
    if (typeIndex < textToType.length) {
        typeElement.innerHTML += textToType.charAt(typeIndex);
        typeIndex++;
        setTimeout(typeWriter, 100);
    }
}

function startCounter(el) {
    const target = +el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || "+";
    let count = 0;
    // Set speed proportional to target for rapid completion (approx 1.5 seconds)
    const increment = target / 60; 

    const updateCount = () => {
        if (count < target) {
            count += increment;
            el.innerText = Math.ceil(count);
            requestAnimationFrame(updateCount);
        } else {
            el.innerText = target + suffix;
        }
    };
    updateCount();
}

// --- 4. Particle Background ---
const canvas = document.getElementById('particle-canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = 'rgba(255, 255, 255, 0.2)';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if(this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if(this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
    }
    draw() {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for(let i=0; i<50; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

// --- Init & Observers ---
window.onload = () => {
    initChart();
    calculate();
    setTimeout(typeWriter, 500);
    initParticles();
    animateParticles();
    
    // Start counters immediately on load
    document.querySelectorAll('.counter').forEach(el => startCounter(el));
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.hidden-up, .hidden-left, .hidden-right').forEach(el => observer.observe(el));

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.querySelector('.scroll-progress').style.width = (winScroll / height) * 100 + "%";
});

document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = 'Message Sent <i class="fas fa-check"></i>';
        btn.style.background = '#28a745';
        setTimeout(() => {
            e.target.reset();
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);
    }, 1500);
});
