// Функция для инициализации dropdown контрибьютора
function setupContributorDropdown(repoName) {
    const dropdown = document.querySelector('.github-custom-dropdown-contrib');
    const button = document.getElementById('dropdownButtonContrib');
    const items = dropdown.querySelectorAll('.menu-item');
    const selectedValue = dropdown.querySelector('.selected-value');
    const hiddenSelect = document.getElementById('real-select-contrib');
    const emptyItem = dropdown.querySelector('.empty-item');
    const contTeg = document.getElementById('cont-card');
    
    if (!button) return;
    
    // Открыть/закрыть меню
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    
    // Выбор контрибьютора
    items.forEach(item => {
        item.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.querySelector('.item-text').textContent;
            
            // Обновить выбранное значение
            if (value) {
                selectedValue.textContent = text;
            } else {
                selectedValue.textContent = 'Выберите контрибьютора';
            }
            
            // Обновить скрытый select
            hiddenSelect.value = value;
            
            // Снять активность со всех
            items.forEach(i => i.classList.remove('active'));
            
            // Активировать выбранный
            this.classList.add('active');
            
            // Закрыть меню
            dropdown.classList.remove('active');
            
            // Загружаем данные контрибьютора
            loadContributorData(repoName, value);
        });
    });
    
    // Закрыть меню при клике вне
    document.addEventListener('click', function(e) {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Закрыть при Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (dropdown) dropdown.classList.remove('active');
        }
    });
    
    // Изначально выбираем "Не выбрано"
    if (emptyItem) {
        setTimeout(() => {
            emptyItem.click();
        }, 100);
    }
    
    // Функция для загрузки данных контрибьютора
function loadContributorData(repoName, contName) {
    if (!contName){
        contTeg.innerHTML = '';
        return;
    }

    fetch(`/conts/${repoName}/${contName}/`)
        .then(response => response.json())
        .then(data => {
            console.log('Данные контрибьютора загружены:', data);
            
            // Создаем контейнер для гистограммы контрибьютора
            contTeg.innerHTML = `
            <h4><a href ="${data.contributor.link}">${data.contributor.name}</a></h4>
            <div class="window">
                <div style="position: relative; min-height: 300px; width: 400px;">
                    <canvas id="contribCommitsChart"></canvas>
                </div>
            </div>
            `;
            
            // Создаем гистограмму коммитов контрибьютора
            if (data.contributor.commit_year && Array.isArray(data.contributor.commit_year) && data.contributor.commit_year.length > 0) {
                const totalContribCommits = data.contributor.commit_count || 
                    data.contributor.commit_year.reduce((sum, val) => sum + val, 0);
                createCommitsHistogram(data.contributor.commit_year, 'contribCommitsChart', totalContribCommits);
            } else {
                document.querySelector('#contribCommitsChart').parentElement.innerHTML = 
                    '<p style="text-align: center; color: #57606a; padding: 50px 0;">Нет данных о коммитах</p>';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных контрибьютора:', error);
            contTeg.innerHTML = '<p class="error">Ошибка при загрузке данных</p>';
        });
}
}

// Обновляем ссылку
let aUpdate = document.getElementById('update');
let aDevName = document.getElementById('developer_name');
aUpdate.href = `/update_user/?username=${aDevName.textContent}`;

// Инициализация кастомного dropdown для репозиториев
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.github-custom-dropdown');
    const button = document.getElementById('dropdownButton');
    const items = document.querySelectorAll('.menu-item');
    const selectedValue = document.querySelector('.selected-value');
    const hiddenSelect = document.getElementById('real-select');
    const emptyItem = document.querySelector('.empty-item');
    
    // Открыть/закрыть меню
    if (button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }
    
    // Выбор элемента
    items.forEach(item => {
        item.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.querySelector('.item-text').textContent;
            
            // Обновить выбранное значение
            if (value) {
                selectedValue.textContent = text;
            } else {
                selectedValue.textContent = 'Выберите репозиторий';
            }
            
            // Обновить скрытый select
            hiddenSelect.value = value;
            
            // Снять активность со всех
            items.forEach(i => i.classList.remove('active'));
            
            // Активировать выбранный
            this.classList.add('active');
            
            // Закрыть меню
            dropdown.classList.remove('active');
            
            // Загружаем данные выбранного репозитория
            loadRepoData(value);
        });
    });
    
    // Закрыть меню при клике вне
    document.addEventListener('click', function(e) {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Закрыть при Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (dropdown) dropdown.classList.remove('active');
        }
    });
    
    // Изначально выбираем "Не выбрано"
    if (emptyItem) {
        setTimeout(() => {
            emptyItem.click();
        }, 100);
    }
});