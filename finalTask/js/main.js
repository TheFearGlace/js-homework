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
    mainList.count = data.count;
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
        <td><button onclick="getInfo(\'${list.body[i].homeworld}\', \'${list.body[i].name}\', 'homeworld')">Show</button></td>
        <td><button onclick="getInfo(\'${list.body[i].species[0]}\', \'${list.body[i].name}\', 'species')">Show</button></td>
        </tr>`;
    }
    document.querySelector('table tbody').insertAdjacentHTML('afterbegin', body);
    //Переключение страниц
    let buttons = document.querySelector('.scroll-buttons');
    if(list.count >= 10) {
        buttons.innerHTML = '';
        buttons.insertAdjacentHTML("afterbegin", "<div></div><div></div>");
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
    } else {
        document.querySelector('.scroll-buttons').innerHTML = '';
    }
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


function getInfo(link, characterName, type) {
    fetch(`${link}?format=json`).then(function(response) {
        return response.json();
    }).then(function(data) {
        if(type === 'homeworld') {
            getHomeworld(data, characterName);
        } else {
            getSpecies(data, characterName);
        }
    }).catch(function(error) {
        console.error(error);
        return '';
    });
}

//окно с инфой о homeworld
function getHomeworld(data, characterName) {
    let info = document.querySelector('.windows').children[0];
    info.classList = 'homeworld-info bottom-left';
    info.innerHTML = '';
    let body = `
    <span onclick="closeWindow('.homeworld-info')">close</span>
    <h4>${characterName} Homeworld</h4>
    <ul>
        <li>Name: <span>${data.name}</span></li>
        <li>Climate: <span>${data.climate}</span></li>
        <li>Terrain: <span>${data.terrain}</span></li>
        <li>Population: <span>${data.population}</span></li>
    </ul>`;
    info.innerHTML = body;
    info.onmousedown = function(event) {
        moveOn(event, info);
        this.classList.remove('bottom-left');
    };
    info.ondragstart = function() {
        return false;
    };
}

//окно с инфой о species
function getSpecies(data, characterName) {
    let info = document.querySelector('.windows').children[1];
    info.classList = 'species-info bottom-right';
    info.innerHTML = '';
    let body = `
    <span onclick="closeWindow('.species-info')">close</span>
    <h4>${characterName} Species</h4>
    <ul>
        <li>Name: <span>${data.name}</span></li>
        <li>Artificial: <span>${data.artificial}</span></li>
        <li>Designation: <span>${data.designation}</span></li>
        <li>Average height: <span>${data.average_height}</span></li>
        <li>Average lifespan: <span>${data.average_lifespan}</span></li>
        <li>Language: <span>${data.language}</span></li>
    </ul>`;
    info.innerHTML = body;
    info.onmousedown = function(event) {
        moveOn(event, info);
        this.classList.remove('bottom-right');
    };
    info.ondragstart = function() {
        return false;
    };
}

//движение обьектов
function moveOn(event, object) {
    let shiftX = event.clientX - object.getBoundingClientRect().left;
    let shiftY = event.clientY - object.getBoundingClientRect().top;
    moveAt(event);
    function moveAt(event) {
        object.style.left = event.pageX - shiftX + 'px';
        object.style.top = event.pageY - shiftY + 'px';
    }
    document.addEventListener('mousemove', moveAt);
    object.onmouseup = function() {
        document.removeEventListener('mousemove', moveAt);
        object.onmouseup = null;
    };
}

function closeWindow(className) {
    let object = document.querySelector(className);
    object.innerHTML = '';
    object.classList = '';
}