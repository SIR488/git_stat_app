let selectRepos = document.getElementById('repos');
let repoTeg = document.getElementById('repo-card');

dateToStr = function (date) {
    let [year, month, day] = date.split('T')[0].split('-');
    return `${day}.${month}.${year}`;
}

let contributorsBlock = document.getElementById('contributors');

selectRepos.onchange = function () {
    let repoName = this.value;
    
    if (!repoName){
        repoTeg.innerHTML = '';
        contributorsBlock.innerHTML = '';
        return;
    }

    fetch(`/repos/${repoName}/`)
        .then(response => response.json())
        .then(data => {
            repoTeg.innerHTML = `
            <p><a href ="${data.repo.link}"><strong>${data.repo.name}</strong></a></p>
            <div>
                <p>Дата создания ${dateToStr(data.repo.created_at)}</p>
                <p>Дата последнего обновления ${dateToStr(data.repo.updated_at)}</p>
                <p>Количество форков ${data.repo.forks_count}</p>
                <p>Звёзды ${data.repo.stars}</p>
                <p>Общее число коммитов ${data.repo.commits}</p>
            </div>
            <div>
                <p>Стек разработки: ${JSON.stringify(data.repo.tech_stack)}</p>
                <img>
            </div>
            <div>
                <p>Коммиты за последний год ${data.repo.commit_month}</p>
                <img>
            </div>
            `
            contributorsBlock.innerHTML = `
            <h4>Контрибьютор</h4>
            <div class="choice">
                <select id="conts">
                    <option value="">Выберите контрибьютора...</option>
                    ${data.contributors.map(cont => `<option value="${cont}">${cont}</option>`).join('')}
                </select>
            </div>
            <div id="cont-card"></div>
            `
            setupContributorSelect();
        })
};
function setupContributorSelect(){
    let selectConts = document.getElementById('conts');
    let contTeg = document.getElementById('cont-card');


    selectConts.onchange = function () {
        let repoName = selectRepos.value;
        let contName = this.value;
        if (!contName){
            contTeg.innerHTML = '';
            return;
        }

        fetch(`/conts/${repoName}/${contName}/`)
            .then(response => response.json())
            .then(data => {
                contTeg.innerHTML = `
                <p><a href ="${data.contributor.link}"><strong>${data.contributor.name}</strong></a></p>
                <div>
                    <p>Общее число коммитов ${data.contributor.commits}</p>
                </div>
                <div>
                    <p>Коммиты за последний год ${data.contributor.commit_month}</p>
                    <img>
                </div>
                `
            })
    };
}