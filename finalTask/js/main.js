window.onload = checkCookie;

let mainList = {};
let dragHomeWindow = false;
let dragSpecieWindow = false;
let url = 'https://swapi.dev/api/people/?format=json&page=1';
const mainKeys = new Array('name', 'birth_year', 'gender', 'homeworld', 'species');

function checkCookie() {
    if(getCookie('name') !== undefined && getCookie('name') !== '') {
        document.querySelector('.search').value = getCookie('name');
        search();
    } else if(getCookie('url') !== undefined && getCookie('url') !== url) {
        url = decodeURIComponent(getCookie('url'));
        getList();
    } else {
        getList();
    }
} 

//общая работа с основым списком
function getList() {
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(data) {
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
        <td><button onclick="getInfo(\'${list.body[i].homeworld}\', \'${list.body[i].name}\', 'homeworld')">Home</button></td>
        <td><button onclick="getInfo(\'${list.body[i].species[0]}\', \'${list.body[i].name}\', 'species')">Specie</button></td>
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
                setCookie('url', encodeURIComponent(url), {'max-age': 600});
                getList();
            }
        });
        buttons.children[1].addEventListener('click', function() {
            if(list.next !== null) {
                url = list.next;
                setCookie('url', encodeURIComponent(url), {'max-age': 600});
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
    this.value = this.value !== undefined ? this.value : getCookie('name');
    setCookie('name', this.value, {'max-age': 600});
    deleteCookie('url');
    let link = `https://swapi.dev/api/people/?format=json&search=${getCookie('name')}`;
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
    if(dragHomeWindow) {
        info.classList = 'homeworld-info';
    } else {
        info.classList = 'homeworld-info bottom-left';
    }
    info.innerHTML = '';
    let body = `
    <span onclick="closeWindow('.homeworld-info')">close</span>
    <h4>${characterName} Homeworld</h4>
    <ul>
        <li>Name: <span>${data.name}</span></li>
        <li>Diameter: <span>${data.diameter}</span></li>
        <li>Climate: <span>${data.climate}</span></li>
        <li>Terrain: <span>${data.terrain}</span></li>
        <li>Population: <span>${data.population}</span></li>
    </ul>`;
    info.innerHTML = body;
    info.onmousedown = function(event) {
        moveOn(event, info);
        this.classList.remove('bottom-left');
        dragHomeWindow = true;
    };
    info.ondragstart = function() {
        return false;
    };
}

//окно с инфой о species
function getSpecies(data, characterName) {
    let info = document.querySelector('.windows').children[1];
    if(dragSpecieWindow) {
        info.classList = 'species-info';
    } else {
        info.classList = 'species-info bottom-right';
    }
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
        dragSpecieWindow = true;
    };
    info.ondragstart = function() {
        return false;
    };
}

function closeWindow(className) {
    let object = document.querySelector(className);
    object.innerHTML = '';
    object.classList = '';
}

//движение обьектов
function moveOn(event, object) {
    let shiftX = event.clientX - object.getBoundingClientRect().left;
    let shiftY = event.clientY - object.getBoundingClientRect().top;
    moveAt(event);
    function moveAt(event) {
        if(event.pageX > 0) {
            object.style.left = event.pageX - shiftX + 'px';
        }
        if(object.getBoundingClientRect().top > 0) {
            object.style.top = event.pageY - shiftY + 'px';
        } else {
            stop();
            object.style.top = '1px';
        }
    }
    document.addEventListener('mousemove', moveAt);
    object.onmouseup = stop;
    function stop() {
        document.removeEventListener('mousemove', moveAt);
        object.onmouseup = null;
    }
}

//работа с куками
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  function setCookie(name, value, options = {}) {
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }
  
    document.cookie = updatedCookie;
  }

  function deleteCookie(name) {
    setCookie(name, "", {
      'max-age': -1
    });
  }