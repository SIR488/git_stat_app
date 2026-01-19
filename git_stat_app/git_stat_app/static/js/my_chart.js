// Универсальная функция для создания круговой диаграммы в стиле GitHub
function createDoughnutChart(techStackData, canvasId, titleText = 'Стек технологий', unitText = 'всего коммитов') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas с id "${canvasId}" не найден`);
        return null;
    }
    
    // Удаляем предыдущую диаграмму если есть
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Подготавливаем данные для Chart.js
    const labels = Object.keys(techStackData);
    const data = Object.values(techStackData);
    const total = data.reduce((sum, val) => sum + val, 0);
    
    // Цвета в стиле GitHub (используем цвета из github-linguist для языков программирования)
    const colors = [
        '#3572A5',  // Python - синий
        '#F1E05A',  // JavaScript - желтый
        '#E34C26',  // HTML - оранжевый
        '#563D7C',  // CSS - фиолетовый
        '#B07219',  // Java - коричневый
        '#00ADD8',  // Go - голубой
        '#178600',  // TypeScript - зеленый
        '#F18E33',  // Kotlin - оранжевый
        '#A97BFF',  // Swift - фиолетовый
        '#00B4AB',  // Dart - бирюзовый
        '#2B7489',  // TypeScript темный
        '#DE4C36',  // Ruby - красный
        '#4F5D95',  // PHP - сине-фиолетовый
        '#CCCCCC',  // C++ - серый
        '#3D6117',  // C# - зеленый
        '#DA5B0B',  // Rust - темно-оранжевый
    ];
    
    // Создаем диаграмму
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 10,
                borderRadius: 3,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
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
                        boxWidth: 12,
                        boxHeight: 12,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
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
                            return [];
                        }
                    },
                    onClick: function(evt, legendItem, legend) {
                        return false;
                    }
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
                    padding: {
                        top: 0,
                        bottom: 15
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 800,
                easing: 'easeOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        },
        // Добавляем плагин для текста в центре ТОЛЬКО для этой диаграммы
        plugins: [{
            id: 'centerText',
            afterDraw(chart) {
                const { ctx, chartArea: { left, right, top, bottom, width, height } } = chart;
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2;
                
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Общее количество
                const total = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                
                ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
                ctx.fillStyle = '#24292f';
                ctx.fillText(total.toString(), centerX, centerY - 10);
                
                // Подпись
                ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
                ctx.fillStyle = '#57606a';
                ctx.fillText(unitText, centerX, centerY + 15);
                
                ctx.restore();
            }
        }]
    });
    
    // Сохраняем ссылку на диаграмму
    canvas.chart = chart;
    
    return chart;
}

// Функция для создания гистограммы коммитов за год
function createCommitsHistogram(commitsData, canvasId, totalCommits) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas с id "${canvasId}" не найден`);
        return null;
    }
    
    // Удаляем предыдущую диаграмму если есть
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Проверяем, что данные есть и это массив
    if (!Array.isArray(commitsData) || commitsData.length === 0) {
        console.error('Нет данных о коммитах или данные не в формате массива');
        return null;
    }
    
    // Получаем текущую дату для определения месяцев
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0 - январь, 11 - декабрь
    
    // Создаем массив месяцев в обратном порядке (от текущего до 12 месяцев назад)
    const months = [];
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    for (let i = 0; i < commitsData.length; i++) {
        // Вычисляем индекс месяца (от текущего назад)
        let monthIndex = currentMonth - i;
        if (monthIndex < 0) monthIndex += 12;
        months.unshift(monthNames[monthIndex]); // Добавляем в начало для правильного порядка
    }
    
    // Переворачиваем данные, чтобы шли от самого старого к самому новому
    const reversedData = [...commitsData].reverse();
    const labels = months;
    
    // Определяем максимальное значение для настройки шкалы
    const maxCommits = Math.max(...reversedData);
    
    // Создаем гистограмму
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Коммиты',
                data: reversedData,
                backgroundColor: '#0969da', // Синий цвет GitHub
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
                legend: {
                    display: false // Скрываем легенду для гистограммы
                },
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
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return `Коммитов: ${context.raw}`;
                        }
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
                    padding: {
                        top: 0,
                        bottom: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#eaeef2',
                        borderColor: '#eaeef2'
                    },
                    ticks: {
                        color: '#57606a',
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                            size: 11
                        },
                        precision: 0,
                        callback: function(value) {
                            if (value === 0) return '0';
                            return value;
                        }
                    },
                    title: {
                        display: false
                    },
                    max: maxCommits > 0 ? Math.ceil(maxCommits * 1.1) : 10 // Добавляем 10% сверху
                },
                x: {
                    grid: {
                        display: false
                    },
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
    
    // Сохраняем ссылку на диаграмму
    canvas.chart = chart;
    
    return chart;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Получаем данные из элемента, созданного json_script
    const techStackElement = document.getElementById('tech-stack-data');
    
    if (techStackElement) {
        try {
            const techStackData = JSON.parse(techStackElement.textContent);
            console.log('Данные стека пользователя загружены:', techStackData);
            
            // Создаем диаграмму для пользователя
            createDoughnutChart(techStackData, 'techStackChart', 'Стек разработки', 'всего байт');
        } catch (error) {
            console.error('Ошибка при парсинге данных:', error);
        }
    }
    
    // Создаем гистограмму коммитов для пользователя
    try {
        // Получаем данные о коммитах пользователя
        const commitsElement = document.getElementById('commits-data');
        let commitsData = [];
        let totalCommits = 0;
        
        if (commitsElement) {
            // Если данные в JSON
            commitsData = JSON.parse(commitsElement.textContent);
            totalCommits = commitsData.reduce((sum, val) => sum + val, 0);
        } else {
            // Альтернативно: получаем из data-атрибута
            const commitDataAttr = document.querySelector('[data-commits]');
            if (commitDataAttr) {
                commitsData = JSON.parse(commitDataAttr.dataset.commits);
                totalCommits = commitDataAttr.dataset.total 
                    ? parseInt(commitDataAttr.dataset.total) 
                    : commitsData.reduce((sum, val) => sum + val, 0);
            }
        }
        
        if (commitsData && commitsData.length > 0) {
            createCommitsHistogram(commitsData, 'userCommitsChart', totalCommits);
        }
    } catch (error) {
        console.error('Ошибка при создании гистограммы коммитов:', error);
    }
});