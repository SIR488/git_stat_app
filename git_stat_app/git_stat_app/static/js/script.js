// Удаляем старый селект и используем кастомный
let repoTeg = document.getElementById('repo-card');
let contributorsBlock = document.getElementById('contributors');

dateToStr = function (date) {
    let [year, month, day] = date.split('T')[0].split('-');
    return `${day}.${month}.${year}`;
}

// Функция для загрузки данных репозитория
function loadRepoData(repoName) {
    if (!repoName){
        repoTeg.innerHTML = '';
        contributorsBlock.innerHTML = '';
        return;
    }

    fetch(`/repos/${repoName}/`)
        .then(response => response.json())
        .then(data => {
            console.log('Данные репозитория:', data);
            
            // Создаем контейнер для диаграммы репозитория
            repoTeg.innerHTML = `
            <h4><a href ="${data.repo.link}">${data.repo.name}</a></h4>
            <div class="window repo-info">
                <p>Дата создания ${dateToStr(data.repo.created_at)}</p>
                <p>Дата последнего обновления ${dateToStr(data.repo.updated_at)}</p>
                <p>Количество форков ${data.repo.forks_count}</p>
                <p>Звёзды ${data.repo.stars}</p>
            </div>
            <div class="windows">
                <div class="window">
                    <h4>Стек технологий репозитория</h4>
                    <div style="position: relative; min-height: 300px; width: 400px;">
                        <canvas id="repoStackChart"></canvas>
                    </div>
                </div>
                <div class="window">
                    <div style="position: relative; min-height: 300px; width: 400px;">
                        <canvas id="repoCommitsChart"></canvas>
                    </div>
                </div>
            </div>
            `;
            
            // Создаем диаграмму для стека технологий репозитория
            if (data.repo.tech_stack && Object.keys(data.repo.tech_stack).length > 0) {
                console.log('Стек технологий репозитория:', data.repo.tech_stack);
                // Используем ту же функцию для создания диаграммы
                const repoTotal = Object.values(data.repo.tech_stack).reduce((sum, val) => sum + val, 0);
                createDoughnutChart(
                    data.repo.tech_stack, 
                    'repoStackChart', 
                    'Стек технологий репозитория', 
                    'всего файлов в репозитории'
                );
            } else {
                console.log('Нет данных о стеке технологий репозитория');
                document.querySelector('#repoStackChart').parentElement.innerHTML = 
                    '<p style="text-align: center; color: #57606a; padding: 50px 0;">Нет данных о стеке технологий</p>';
            }
            
            // Создаем гистограмму для коммитов репозитория - ВОТ ТУТ ВСТАВЛЯЕМ
            if (data.repo.commit_year && Array.isArray(data.repo.commit_year) && data.repo.commit_year.length > 0) {
                const totalRepoCommits = data.repo.commit_year.reduce((sum, val) => sum + val, 0);
                createCommitsHistogram(data.repo.commit_year, 'repoCommitsChart', totalRepoCommits);
            } else {
                document.querySelector('#repoCommitsChart').parentElement.innerHTML = 
                    '<p style="text-align: center; color: #57606a; padding: 50px 0;">Нет данных о коммитах</p>';
            }
            
            // Создаем кастомный dropdown для контрибьюторов
            contributorsBlock.innerHTML = `
<h3>Контрибьютор</h3>
<div style="width: 320px; margin-top: 10px;">
    <div class="github-custom-dropdown-contrib">
        <select id="real-select-contrib" style="display: none;">
            <option value="">Выберите контрибьютора</option>
            ${data.contributors.map(cont => `<option value="${cont}">${cont}</option>`).join('')}
        </select>
        
        <div class="dropdown-button" id="dropdownButtonContrib">
            <div class="button-content">
                <span class="selected-value">Выберите контрибьютора</span>
                <div class="repo-count">${data.contributors.length} contributors</div>
            </div>
        </div>
        
        <div class="dropdown-menu" id="dropdownMenuContrib">
            <div class="menu-items">
                <div class="menu-item empty-item" data-value="">
                    <div class="item-left">
                        <svg width="16" height="16" viewBox="0 0 16 16" class="repo-icon empty-icon">
                            <path fill="#8b949e" d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>
                        </svg>
                        <span class="item-text empty-text">Не выбрано</span>
                    </div>
                    <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" style="display: none;">
                        <path fill="#0969da" d="M13.78 4.22a.75.75 0 0 1 1.06 0l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
                    </svg>
                </div>
                
                ${data.contributors.map(cont => `
                <div class="menu-item" data-value="${cont}">
                    <div class="item-left">
                        <svg width="16" height="16" viewBox="0 0 16 16" class="repo-icon">
                            <path fill="#57606a" d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>
                        </svg>
                        <span class="item-text">${cont}</span>
                    </div>
                    <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" style="display: none;">
                        <path fill="#0969da" d="M13.78 4.22a.75.75 0 0 1 1.06 0l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
                    </svg>
                </div>
                `).join('')}
            </div>
        </div>
    </div>
</div>
<div id="cont-card"></div>
`;
            
            // Инициализируем dropdown для контрибьюторов
            setupContributorDropdown(repoName);
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных репозитория:', error);
            repoTeg.innerHTML = '<p class="error">Ошибка при загрузке данных</p>';
        });
}