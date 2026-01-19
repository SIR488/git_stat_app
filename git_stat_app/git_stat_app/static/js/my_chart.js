// Универсальная функция для создания круговой диаграммы в стиле GitHub
function createDoughnutChart(techStackData, canvasId, titleText = 'Стек технологий', unitText = 'всего коммитов') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    if (canvas.chart) canvas.chart.destroy();
    
    const ctx = canvas.getContext('2d');
    const labels = Object.keys(techStackData);
    const data = Object.values(techStackData);
    const total = data.reduce((sum, val) => sum + val, 0);
    
    const colors = [
        '#3572A5', '#F1E05A', '#E34C26', '#563D7C',
        '#B07219', '#00ADD8', '#178600', '#F18E33',
        '#A97BFF', '#00B4AB', '#2B7489', '#DE4C36',
        '#4F5D95', '#CCCCCC', '#3D6117', '#DA5B0B',
    ];
    
    canvas.style.pointerEvents = 'auto';
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#ffffff',
                borderWidth: 1,
                hoverBorderWidth: 2,
                hoverOffset: 4,
                borderRadius: 2,
                spacing: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
            interaction: {
                mode: 'nearest',
                intersect: true,
                includeInvisible: true
            },
            hover: {
                mode: 'nearest',
                intersect: true,
                animationDuration: 0
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#57606a',
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                            size: 12,
                            weight: '400'
                        },
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        pointRadius: 6,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (!data.labels.length || !data.datasets.length) return [];
                            return data.labels.map(function(label, i) {
                                const value = data.datasets[0].data[i];
                                const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return {
                                    text: `${label} - ${value} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: '#ffffff',
                                    lineWidth: 1,
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                    },
                    onClick: function() { return false; }
                },
                tooltip: {
                    backgroundColor: 'rgba(36, 41, 47, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#f6f8fa',
                    borderColor: '#0969da',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 6,
                    displayColors: true,
                    boxPadding: 4,
                    usePointStyle: true,
                    animation: { duration: 0 },
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${value} байт (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: titleText,
                    color: '#24292f',
                    font: {
                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                        size: 14,
                        weight: '600'
                    },
                    padding: { top: 0, bottom: 15 }
                }
            },
            elements: {
                arc: {
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart',
                onProgress: function(animation) {
                    if (animation.currentStep !== animation.numSteps) {
                        chart.update('none');
                    }
                },
                onComplete: function() {
                    chart.options.hover.animationDuration = 0;
                }
            },
            transitions: {
                active: {
                    animation: { duration: 0 }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            afterDraw: function(chart) {
                const { ctx, chartArea } = chart;
                if (!chartArea) return;
                
                const centerX = (chartArea.left + chartArea.right) / 2;
                const centerY = (chartArea.top + chartArea.bottom) / 2;
                
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const total = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                
                ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
                ctx.fillStyle = '#24292f';
                ctx.fillText(total.toString(), centerX, centerY - 10);
                
                ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
                ctx.fillStyle = '#57606a';
                ctx.fillText(unitText, centerX, centerY + 15);
                
                ctx.restore();
            }
        }]
    });
    
    setTimeout(() => {
        chart.options.hover.animationDuration = 0;
        chart.update('none');
    }, 1100);
    
    canvas.chart = chart;
    return chart;
}

// Функция для создания гистограммы коммитов за год
function createCommitsHistogram(commitsData, canvasId, totalCommits) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    if (canvas.chart) canvas.chart.destroy();
    
    const ctx = canvas.getContext('2d');
    if (!Array.isArray(commitsData) || commitsData.length === 0) return null;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const months = [];
    
    for (let i = 0; i < commitsData.length; i++) {
        let monthIndex = currentMonth - i;
        if (monthIndex < 0) monthIndex += 12;
        months.unshift(monthNames[monthIndex]);
    }
    
    const reversedData = [...commitsData].reverse();
    const maxCommits = Math.max(...reversedData);
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Коммиты',
                data: reversedData,
                backgroundColor: '#0969da',
                borderColor: '#0969da',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#0a58ca',
                hoverBorderColor: '#0a58ca',
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(36, 41, 47, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#f6f8fa',
                    borderColor: '#0969da',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 6,
                    displayColors: false,
                    callbacks: {
                        title: context => context[0].label,
                        label: context => `Коммитов: ${context.raw}`
                    }
                },
                title: {
                    display: true,
                    text: `Коммиты за последний год (${totalCommits} всего)`,
                    color: '#24292f',
                    font: {
                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                        size: 14,
                        weight: '600'
                    },
                    padding: { top: 0, bottom: 20 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#eaeef2', borderColor: '#eaeef2' },
                    ticks: {
                        color: '#57606a',
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                            size: 11
                        },
                        precision: 0,
                        callback: value => value === 0 ? '0' : value
                    },
                    max: maxCommits > 0 ? Math.ceil(maxCommits * 1.1) : 10
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#57606a',
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                            size: 11,
                            weight: '400'
                        }
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    canvas.chart = chart;
    return chart;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const techStackElement = document.getElementById('tech-stack-data');
    if (techStackElement) {
        const techStackData = JSON.parse(techStackElement.textContent);
        createDoughnutChart(techStackData, 'techStackChart', 'Стек разработки', 'всего байт');
    }
    
    const commitsElement = document.getElementById('commits-data');
    if (commitsElement) {
        const commitsData = JSON.parse(commitsElement.textContent);
        const totalCommits = commitsData.reduce((sum, val) => sum + val, 0);
        createCommitsHistogram(commitsData, 'userCommitsChart', totalCommits);
    }
});