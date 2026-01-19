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
    
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    
    items.forEach(item => {
        item.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.querySelector('.item-text').textContent;
            
            if (value) {
                selectedValue.textContent = text;
            } else {
                selectedValue.textContent = 'Выберите контрибьютора';
            }
            
            hiddenSelect.value = value;
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            dropdown.classList.remove('active');
            loadContributorData(repoName, value);
        });
    });
    
    document.addEventListener('click', function(e) {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dropdown) {
            dropdown.classList.remove('active');
        }
    });
    
    if (emptyItem) {
        setTimeout(() => emptyItem.click(), 100);
    }
    
    // Функция для загрузки данных контрибьютора
    function loadContributorData(repoName, contName) {
        if (!contName) {
            contTeg.innerHTML = '';
            return;
        }
        
        fetch(`/conts/${repoName}/${contName}/`)
            .then(response => response.json())
            .then(data => {
                contTeg.innerHTML = `
                <h4><a href="${data.contributor.link}">${data.contributor.name}</a></h4>
                <div class="window">
                    <div style="position: relative; min-height: 300px; width: 400px;">
                        <canvas id="contribCommitsChart"></canvas>
                    </div>
                </div>`;
                
                if (data.contributor.commit_year && Array.isArray(data.contributor.commit_year) && data.contributor.commit_year.length > 0) {
                    const totalContribCommits = data.contributor.commit_count || 
                        data.contributor.commit_year.reduce((sum, val) => sum + val, 0);
                    createCommitsHistogram(data.contributor.commit_year, 'contribCommitsChart', totalContribCommits);
                } else {
                    document.querySelector('#contribCommitsChart').parentElement.innerHTML = 
                        '<p style="text-align: center; color: #57606a; padding: 50px 0;">Нет данных о коммитах</p>';
                }
            });
    }
}

// Обновляем ссылку
const aUpdate = document.getElementById('update');
const aDevName = document.getElementById('developer_name');
if (aUpdate && aDevName) {
    aUpdate.href = `/update_user/?username=${aDevName.textContent}`;
}

// Инициализация кастомного dropdown для репозиториев
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.github-custom-dropdown');
    const button = document.getElementById('dropdownButton');
    const items = document.querySelectorAll('.menu-item');
    const selectedValue = document.querySelector('.selected-value');
    const hiddenSelect = document.getElementById('real-select');
    const emptyItem = document.querySelector('.empty-item');
    
    if (button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }
    
    items.forEach(item => {
        item.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.querySelector('.item-text').textContent;
            
            if (value) {
                selectedValue.textContent = text;
            } else {
                selectedValue.textContent = 'Выберите репозиторий';
            }
            
            hiddenSelect.value = value;
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            dropdown.classList.remove('active');
            loadRepoData(value);
        });
    });
    
    document.addEventListener('click', function(e) {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dropdown) {
            dropdown.classList.remove('active');
        }
    });
    
    if (emptyItem) {
        setTimeout(() => emptyItem.click(), 100);
    }
});