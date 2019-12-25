window.onload = getList;

let mainList = {};
let url = 'https://swapi.co/api/people/?format=json&page=1';
const mainKeys = new Array('name', 'birth_year', 'gender', 'homeworld', 'species');


//общая работа с основым списком
function getList() {
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(data) {
        //console.log(data);
        return createList(data);
    }).then(function(list) {
        return loadList(list);
    }).catch(function(err) {
        showFakeWindow();
        console.error(err);
    });
}

//создание собственного списка для удобной работы с данными
function createList(data) {
    mainList.header = mainKeys;
    mainList.body = [];
    mainList.previous = data.previous;
    mainList.next = data.next;
    for(let arr in data.results) {
        let row = {};
        for(let key in data.results[arr]) {
            if(mainKeys.indexOf(key) !== -1) {
                row[key] = data.results[arr][key];    
            }
        }
        mainList.body.push(row);
    }
    mainList.header = mainList.header.map(key => key.toUpperCase());
    return mainList;
}

//основная работа с DOM, после его загрузки
function loadList(list) {
    //работа с таблицей 
    document.querySelector('table thead').innerHTML = '';
    document.querySelector('table tbody').innerHTML = '';
    let header = list.header.join('</th><th>');
    document.querySelector('table thead').insertAdjacentHTML('afterbegin', `<tr><th>${header}</th></tr>`);
    let body = '';
    for(let i in list.body) {
        body += `
        <tr>
        <td>${list.body[i].name}</td>
        <td>${list.body[i].birth_year}</td>
        <td>${list.body[i].gender}</td>
        <td><button onclick="getName(\'${list.body[i].homeworld}\')">Show</button></td>
        <td><button onclick="getName(${list.body[i].species[0]})">Show</button></td>
        </tr>`;
    }
    document.querySelector('table tbody').insertAdjacentHTML('afterbegin', body);
    //Переключение страниц
    let buttons = document.querySelector('.scroll-buttons');
    buttons.innerHTML = '';
    buttons.insertAdjacentHTML("afterbegin", "<button>prev</button><button>next</button>");
    buttons.children[0].addEventListener('click', function() {
        if(list.previous !== null) {
            url = list.previous;
            getList();
        }
    });
    buttons.children[1].addEventListener('click', function() {
        if(list.next !== null) {
            url = list.next;
            getList();
        }
    });
    //устанавливаем обрабодчик на поиск после загрузки дом
    let inputSearch = document.querySelector('.search');
    inputSearch.addEventListener("keyup", search);
}

//работа с поиском
function search() {
    let link = `https://swapi.co/api/people/?format=json&search=${this.value}`;
    url = link;
    getList();
}

//выводим если что-то сломалось
function showFakeWindow() {
    let main = document.querySelector('.main');
    main.innerHTML = '';
    let h2 = document.createElement('h2');
    h2.innerHTML = 'Sorry, please try again later';
    main.insertAdjacentElement("afterbegin", h2);
}


function getName(link) {
    fetch(`${link}?format=json`).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data.name);
        return data.name;
    }).catch(function(error) {
        console.error(error);
        return '';
    });
}