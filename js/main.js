(function () {

  let listArrayNames = [{ name: 'Телефон', icon: 'number' }, { name: 'Доп. телефон', icon: 'extra' }, { name: 'Email', icon: 'mail' }, { name: 'Vk', icon: 'vk' }, { name: 'Facebook', icon: 'fb' }];
  let clientsArray = [];
  let clientsPresentationArray = [];
  let handlers;
  let tableColumns;
  let dark;
  let createTable;
  let columns = [];
  let columnsElement = [];
  let loading;
  //Старт приложения
  async function createApp(container, header) {
    let form = document.createElement('input');
    form.classList.add('form-input');
    form.placeholder = 'Введите запрос';
    //Ввод стоки поиска
    form.addEventListener('input', function () {
      setTimeout(function () { searchRequest(form, container) }, 300);
    });
    //Затемнение экрана
    dark = document.createElement('button');
    dark.classList.add('btn');
    dark.classList.add('dark');
    document.body.appendChild(dark);
    dark.style.display = 'none';
    header.append(form);
    //Редактирование таблицы
    handlers = {
      async onDelete({ obj }) {
        await fetch(`http://localhost:3000/api/clients/${obj.id}`, {
          method: 'DELETE',
        });
        renderTable();
      },
      async onEdit({ obj }) {
        await fetch(`http://localhost:3000/api/clients/${obj.id}`, {
          method: 'GET',
        });
        createNewWindow('edit', obj);
      }
    };
    //Создание колонок
    let columnsName = ['ID', 'Фамилия Имя Отчество А-Я', 'Дата и время создания', 'Последние изменения', 'Контакты', 'Действия'];
    tableColumns = document.createElement('div');
    tableColumns.classList.add('container-columns');
    let columnsField = document.createElement('div');
    columnsField.classList.add('columns-div');
    //Загрузка
    loading = document.createElement('div')
    loading.classList.add('loading');
    loading.style.display = 'none';
    tableColumns.append(loading);
    container.append(columnsField);
    for (i = 0; i < columnsName.length; i++) {
      let column = document.createElement('div');
      column.classList.add('column');
      let columnName = document.createElement('button');
      columnName.classList.add('column-name');
      columnName.innerHTML = columnsName[i];
      if (columnName.innerHTML == 'ID') {
        columnName.style.paddingLeft = '19px';
        column.style.paddingRight = '15px';
      }
      columnName.addEventListener('click', function () {
        columnName.classList.toggle('sort');
        //Сортировка колонок
        if (columnName.textContent == columnsName[0]) {
          if (columnName.classList.contains('sort')) {
            clientsPresentationArray.sort((a, b) => (a.id) > (b.id) ? -1 : 1);
          } else {
            clientsPresentationArray.sort((a, b) => (a.id) < (b.id) ? -1 : 1);
          }
        }
        if (columnName.textContent == columnsName[1]) {
          if (columnName.classList.contains('sort')) {
            clientsPresentationArray.sort((a, b) => (a.surname.toUpperCase() + a.name.toUpperCase() + a.lastName.toUpperCase()) > (b.surname.toUpperCase() + b.name.toUpperCase() + b.lastName.toUpperCase()) ? -1 : 1);
          } else {
            clientsPresentationArray.sort((a, b) => (a.surname.toUpperCase() + a.name.toUpperCase() + a.lastName.toUpperCase()) < (b.surname.toUpperCase() + b.name.toUpperCase() + b.lastName.toUpperCase()) ? -1 : 1);
          }
        }
        if (columnName.textContent == columnsName[2]) {
          if (columnName.classList.contains('sort')) {
            clientsPresentationArray.sort((a, b) => (a.createdAt) > (b.createdAt) ? -1 : 1);
          } else {
            clientsPresentationArray.sort((a, b) => (a.createdAt) < (b.createdAt) ? -1 : 1);
          }
        }
        if (columnName.textContent == columnsName[3]) {
          if (columnName.classList.contains('sort')) {
            clientsPresentationArray.sort((a, b) => (a.updatedAt) > (b.updatedAt) ? -1 : 1);
          } else {
            clientsPresentationArray.sort((a, b) => (a.updatedAt) < (b.updatedAt) ? -1 : 1);
          }
        }
        renderElements(container);
      });
      //В последних колонках нет сортировки
      if (columnName.textContent == columnsName[4]) {
        columnName.classList.add('column-not-arrow');
      }
      if (columnName.textContent == columnsName[5]) {
        columnName.classList.add('column-not-arrow');
      }
      column.append(columnName);
      columnsField.append(column);
      columns.push(column);
    }
    //Кнопка добавления клиента
    let addClient = document.createElement('button');
    addClient.classList.add('btn');
    addClient.classList.add('btn-add');
    addClient.textContent = 'Добавить клиента';
    addClient.addEventListener('click', function () {
      createNewWindow('new', null);
    });
    tableColumns.append(columnsField);
    container.append(tableColumns);
    container.append(addClient);
    loading.style.display = 'block';
    await renderTable();
    loading.style.display = 'none';
  }

  //Функция поиска клиента
  async function searchRequest(form, container) {
    loading.style.display = 'block';
    const response = await fetch(`http://localhost:3000/api/clients?search=${form.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    loading.style.display = 'none';
    clientsPresentationArray = data.slice();
    renderElements(container);
  }

  //Запрос на отрисовку таблицы
  async function renderTable() {
    const response = await fetch(`http://localhost:3000/api/clients`);
    const data = await response.json();
    clientsArray = data.slice();
    clientsPresentationArray = clientsArray.slice();
    renderElements();
  }

  //Отрисовка каждого клиента
  function renderElements() {
    dark.style.display = 'none';
    if (createTable) {
      createTable.remove();
    }
    for (c = 0; c < columnsElement.length; c++) {
      columnsElement[c].remove();
    }
    for (i = 0; i < clientsPresentationArray.length; i++) {
      if (clientsPresentationArray[i]) {
        renderClient(clientsPresentationArray[i], handlers, columns);
      }
    }
  }

  //Анимация таблицы
  function tableEffect(obj) {
    obj.classList.add('effect-table');
  }

  //Вывод таблички удаления клиента
  function deleteTable(obj, { onDelete }) {
    dark.style.display = 'block';
    let createDeleteTable = document.createElement('div');
    createDeleteTable.classList.add('create-table');
    setTimeout(function () { tableEffect(createDeleteTable) }, 100);
    document.body.appendChild(createDeleteTable);
    let close = document.createElement('button');
    close.classList.add('btn');
    close.classList.add('close');
    createDeleteTable.append(close);
    close.addEventListener('click', function () {
      dark.style.display = 'none';
      createDeleteTable.remove();
      hiddenTable();
    });
    let h2 = document.createElement('h2');
    h2.textContent = 'Удалить клиента';
    h2.classList.add('create-h2');
    h2.style.justifyContent = 'center';
    h2.style.paddingLeft = '0px';
    h2.style.marginBottom = '11px';
    createDeleteTable.append(h2);
    let h2Text = document.createElement('span');
    h2Text.textContent = 'Вы действительно хотите удалить данного клиента?';
    h2Text.classList.add('create-h2-text');
    createDeleteTable.append(h2Text);

    let deleteButton = document.createElement('button');
    deleteButton.classList.add('btn');
    deleteButton.classList.add('btn-create');
    deleteButton.textContent = 'Удалить';

    let deleteButtonImg = document.createElement('div');
    deleteButtonImg.classList.add('item-loading');
    deleteButton.append(deleteButtonImg);

    createDeleteTable.append(deleteButton);
    deleteButton.addEventListener('click', async function () {
      let loadMini = document.createElement('div');
      loadMini.classList.add('load-mini');
      let emptyObj = document.createElement('button');
      emptyObj.classList.add('empty-obj');
      document.body.appendChild(emptyObj);
      deleteButton.append(loadMini);
      await fetch(`http://localhost:3000/api/clients`);
      onDelete({ obj });
      loadMini.remove();
      emptyObj.remove();
      createDeleteTable.remove();
    });
    let cancel = document.createElement('button');
    cancel.classList.add('btn');
    cancel.classList.add('cancel-btn');
    cancel.textContent = 'Отмена';
    cancel.addEventListener('click', function () {
      dark.style.display = 'none';
      createDeleteTable.remove();
      hiddenTable();
    });
    dark.addEventListener('click', function () {
      dark.style.display = 'none';
      createDeleteTable.remove();
      hiddenTable();
    });
    createDeleteTable.append(cancel);
  }

  //Скрытие таблицы
  function hiddenTable() {
    let table = document.querySelector('.hidden');
    if (table) {
      dark.style.display = 'block';
      table.classList.remove('hidden');
    }
  }

  //Создание таблички удаления или редактирования клиента
  function createNewWindow(action, obj) {
    dark.style.display = 'block';
    createTable = document.createElement('div');
    createTable.classList.add('create-table');
    setTimeout(function () { tableEffect(createTable) }, 100);
    document.body.appendChild(createTable);
    let close = document.createElement('button');
    close.classList.add('btn');
    close.classList.add('close');
    createTable.append(close);
    close.addEventListener('click', function () {
      dark.style.display = 'none';
      createTable.remove();
    });
    let h2 = document.createElement('h2');
    if (action == 'new') {
      h2.textContent = 'Новый клиент';
    }
    if (action == 'edit') {
      h2.textContent = 'Изменить клиента';
      if (obj) {
        let h2ID = document.createElement('div');
        h2ID.classList.add('h2-gray');
        h2ID.textContent = `ID: ${obj.id}`;
        h2.append(h2ID);
      }
    }
    h2.classList.add('create-h2');
    createTable.append(h2);
    let createDiv = document.createElement('div');
    createDiv.classList.add('create-div');
    let createSurname = document.createElement('input');
    createSurname.classList.add('create-input');
    createSurname.placeholder = 'Фамилия*';
    createSurname.addEventListener('input', function () {
      createSurname.classList.remove('input-error');
    });
    let createName = document.createElement('input');
    createName.classList.add('create-input');
    createName.placeholder = 'Имя*';
    createName.addEventListener('input', function () {
      createName.classList.remove('input-error');
    });
    let createLastName = document.createElement('input');
    createLastName.classList.add('create-input');
    createLastName.placeholder = 'Отчество';
    let addContactsDiv = document.createElement('div');
    addContactsDiv.classList.add('div-field');
    let contactsArray = [];
    let addContactsButton = document.createElement('button');
    addContactsButton.classList.add('add-contacts');
    addContactsButton.textContent = 'Добавить контакт';
    addContactsButton.addEventListener('click', function () {
      if (contactsArray.length > 9) {
        return;
      }
      addContactFunction(addContactsDiv, contactsArray);
    });
    addContactsDiv.append(addContactsButton);
    createDiv.append(createSurname);
    createDiv.append(createName);
    createDiv.append(createLastName);
    createTable.append(createDiv);
    createTable.append(addContactsDiv);

    let error = document.createElement('span')
    error.classList.add('error');
    error.style.display = 'none';
    createTable.append(error);
    let saveButton = document.createElement('button');
    saveButton.classList.add('btn');
    saveButton.classList.add('btn-create');
    saveButton.textContent = 'Сохранить';
    createTable.append(saveButton);
    saveButton.addEventListener('click', async function () {
      let contactsObj = [];
      if (!createSurname.value.trim()) {
        error.textContent = `Поле ${createSurname.placeholder} не заполнено`;
        error.style.display = 'block';
        createSurname.classList.add('input-error');
        return false;
      }
      if (!createName.value.trim()) {
        error.textContent = `Поле ${createName.placeholder} не заполнено`;
        error.style.display = 'block';
        createName.classList.add('input-error');
        return false;
      }
      createLastName.value.trim();
      for (i = 0; i < contactsArray.length; i++) {
        if (!contactsArray[i].v.value.trim()) {
          error.textContent = `Поле ${contactsArray[i].t.textContent} не заполнено`;
          contactsArray[i].v.classList.add('input-error');
          error.style.display = 'block';
          return false;
        }
        contactsObj.unshift({ type: contactsArray[i].t.textContent, value: contactsArray[i].v.value });
      }
      if (obj) {
        let loadMini = document.createElement('div');
        loadMini.classList.add('load-mini');
        let emptyObj = document.createElement('button');
        emptyObj.classList.add('empty-obj');
        document.body.appendChild(emptyObj);
        saveButton.append(loadMini);
        await editClientServer(obj, error, createSurname.value, createName.value, createLastName.value, contactsObj);
        loadMini.remove();
        emptyObj.remove();
      } else {
        let loadMini = document.createElement('div');
        loadMini.classList.add('load-mini');
        let emptyObj = document.createElement('button');
        emptyObj.classList.add('empty-obj');
        document.body.appendChild(emptyObj);
        saveButton.append(loadMini);
        await addClientServer(error, createSurname.value, createName.value, createLastName.value, contactsObj);
        loadMini.remove();
        emptyObj.remove();
      }
    });
    let cancel = document.createElement('button');
    cancel.classList.add('btn');
    cancel.classList.add('cancel-btn');
    if (action == 'new') {
      cancel.textContent = 'Отмена';
      cancel.addEventListener('click', function () {
        dark.style.display = 'none';
        createTable.remove();
      });
    }
    if (action == 'edit') {
      cancel.textContent = 'Удалить клиента';
      cancel.addEventListener('click', function () {
        createTable.classList.add('hidden');
        deleteTable(obj, handlers);
      });
    }
    dark.addEventListener('click', function () {
      dark.style.display = 'none';
      createTable.remove();
    });
    createTable.append(cancel);
    if (obj) {
      createSurname.value = obj.surname;
      createName.value = obj.name;
      createLastName.value = obj.lastName;
    }
    if (action == 'edit') {
      for (c = 0; c < obj.contacts.length; c++) {
        addContactFunction(addContactsDiv, contactsArray, obj.contacts[c].type, obj.contacts[c].value);
      }
    }
  }

  //Добавление контактов клиента
  function addContactFunction(div, contactsArray, objList, objValue) {

    if (!div.classList.contains('.div-field-active')) {
      div.classList.add('div-field-active');
    }
    let clientContact = document.createElement('div');
    clientContact.classList.add('client-contact-div');
    let listDiv = document.createElement('div');
    listDiv.classList.add('list-div');
    //Выбор типа контакта
    let list = document.createElement('button');
    if (!objList) {
      list.textContent = 'Телефон';
    } else {
      list.textContent = objList;
    }
    list.classList.add('btn');
    list.classList.add('create-list');
    //Каждый тип берется из массива
    for (i = 0; i < listArrayNames.length; i++) {
      let listElem = document.createElement('button');
      listElem.classList.add('btn');
      listElem.classList.add('list-btn');
      listElem.textContent = listArrayNames[i].name;
      listElem.addEventListener('click', function () {
        list.textContent = listElem.textContent;
        listDiv.classList.remove('list-active');
        if (list.textContent=='Телефон'){
          field.type='number';
        }else{
          field.type='text';
        }
      });
      listDiv.append(listElem);
    }

    list.addEventListener('click', function () {
      listDiv.classList.toggle('list-active');
    });
    let inputDiv = document.createElement('div');
    inputDiv.style.display = 'flex';
    let field = document.createElement('input');
    field.classList.add('contacts-input');
    field.placeholder = 'Введите данные контакта';
    field.type='number';
    //Валидация полей
    field.oninput = function(){
      this.value = this.value.substr(0, 20);
    }

    field.addEventListener('input', function () {
      field.classList.remove('input-error');
    });
    if (!objValue) {
      field.value = '';
    } else {
      field.value = objValue;
    }
    let closeField = document.createElement('button');
    closeField.classList.add('btn');
    closeField.classList.add('close-field');
    closeField.addEventListener('click', function () {
      for (i = 0; i < contactsArray.length; i++) {
        if (contactsArray[i].t == list) {
          contactsArray.splice(i, 1);
          clientContact.remove();
          break;
        }
      }
    });
    inputDiv.append(field);
    inputDiv.append(closeField);
    clientContact.append(listDiv);
    clientContact.append(list);
    clientContact.append(inputDiv);
    div.prepend(clientContact);
    contactsArray.push({ t: list, v: field });
  }

  //Запрос редактирования клиента
  async function editClientServer(obj, error, createSurname, createName, createLastName, contactsObj) {
    const response = await fetch(`http://localhost:3000/api/clients/${obj.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: createName, surname: createSurname, lastName: createLastName, contacts: contactsObj
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.status == '422' || response.status == '404' || response.status == '5xx') {
      error.style.display = 'block';
      error.textContent = `Ошибка ${response.status}`;
      return false;
    } else if (response.status == '200' || response.status == '201') {
      renderTable();
    } else {
      error.style.display = 'block';
      error.textContent = 'Что-то пошло не так...';
    }
  }
  //Запрос добавления клиента
  async function addClientServer(error, createSurname, createName, createLastName, contactsObj) {
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: createName, surname: createSurname, lastName: createLastName, contacts: contactsObj
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.status == '422' || response.status == '404' || response.status == '5xx') {
      error.style.display = 'block';
      error.textContent = `Ошибка ${response.status}`;
      return false;
    } else if (response.status == '200' || response.status == '201') {
      renderTable();
    } else {
      error.style.display = 'block';
      error.textContent = 'Что-то пошло не так...';
    }
  }
  //Отрисовка конкретного клиента в каждой колонке
  function renderClient(obj, { onEdit }, columns) {
    if (obj) {
      //ID
      let stringID = document.createElement('div');
      stringID.textContent = clientsPresentationArray[i].id;
      stringID.classList.add('clients-gray');
      stringID.classList.add('clients-string');
      columns[0].append(stringID);
      columnsElement.push(stringID);
      //Name
      let stringName = document.createElement('div');
      stringName.textContent = clientsPresentationArray[i].name + ' ' + clientsPresentationArray[i].lastName + ' ' + clientsPresentationArray[i].surname;
      stringName.classList.add('clients-text');
      stringName.classList.add('clients-string');
      columns[1].append(stringName);
      columnsElement.push(stringName);
      //Date
      let dateDiv = document.createElement('div');
      let dateString = new Date(clientsPresentationArray[i].createdAt);
      dateDiv.classList.add('date-div');
      dateDiv.classList.add('clients-string');
      let stringDate = document.createElement('div');
      stringDate.textContent = `${dateString.getDate()}.${(dateString.getMonth() + 1)}.${dateString.getFullYear()}`;
      stringDate.classList.add('clients-text');
      let stringHours = document.createElement('div');
      stringHours.textContent = `${dateString.getHours()}:${dateString.getMinutes()}`;
      stringHours.classList.add('clients-gray');
      stringHours.style.fontSize = '14px';
      dateDiv.append(stringDate);
      dateDiv.append(stringHours);
      columns[2].append(dateDiv);
      columnsElement.push(dateDiv);
      //Changes
      let changesDiv = document.createElement('div');
      let changesString = new Date(clientsPresentationArray[i].updatedAt);
      changesDiv.classList.add('date-div');
      changesDiv.classList.add('clients-string');
      let stringChanges = document.createElement('div');
      stringChanges.textContent = `${changesString.getDate()}.${(changesString.getMonth() + 1)}.${changesString.getFullYear()}`;
      stringChanges.classList.add('clients-text');
      let stringChangesHours = document.createElement('div');
      stringChangesHours.textContent = `${changesString.getHours()}:${changesString.getMinutes()}`;
      stringChangesHours.classList.add('clients-gray');
      stringChangesHours.style.fontSize = '14px';
      changesDiv.append(stringChanges);
      changesDiv.append(stringChangesHours);
      columns[3].append(changesDiv);
      columnsElement.push(changesDiv);
      //Contacts
      let arr = [];
      let stringContacts = document.createElement('div');
      stringContacts.classList.add('contact-icon-div');
      columns[4].style.width = '115px';
      if (clientsPresentationArray[i].contacts.length > 0) {
        for (e = 0; e < clientsPresentationArray[i].contacts.length; e++) {
          let contactIcon = document.createElement('div');
          contactIcon.classList.add('contact-icon');
          let contactText = document.createElement('div');
          contactText.classList.add('contact-icon-text');
          let contactTextHref = document.createElement('a');
          contactTextHref.classList.add('contact-a');
          contactText.textContent = `${clientsPresentationArray[i].contacts[e].type}: `;
          contactTextHref.textContent = `${clientsPresentationArray[i].contacts[e].value}`;
          contactTextHref.href = clientsPresentationArray[i].contacts[e].value;
          contactText.append(contactTextHref);
          for (c = 0; c < listArrayNames.length; c++) {
            if (clientsPresentationArray[i].contacts[e].type == listArrayNames[c].name) {
              contactIcon.classList.add(listArrayNames[c].icon);
            }
          }
          contactIcon.append(contactText);
          stringContacts.append(contactIcon);
          if (e > 3) {
            arr.push(contactIcon);
            contactIcon.style.display = 'none';
          }
        }
        if (arr.length > 0) {
          let more = document.createElement('div');
          more.classList.add('contact-icon');
          more.classList.add('contact-more');
          let moreText = document.createElement('div');
          moreText.classList.add('contact-more-text');
          moreText.textContent = `+${arr.length}`;
          more.append(moreText);
          more.addEventListener('click', function () {
            for (a = 0; a < arr.length; a++) {
              arr[a].style.display = 'block';
            }
            stringContacts.style.flexWrap = 'wrap';
            more.remove();
          });
          stringContacts.append(more);
        }
      }
      columns[4].append(stringContacts);
      columnsElement.push(stringContacts);
      //Actions
      let changeButtonDiv = document.createElement('div');
      changeButtonDiv.classList.add('clients-change-div');
      changeButtonDiv.classList.add('clients-string');
      let stringButtonChange = document.createElement('div');
      stringButtonChange.textContent = 'Изменить'
      stringButtonChange.classList.add('clients-text');
      stringButtonChange.classList.add('clients-change');
      let stringButtonChangeImg = document.createElement('div');
      stringButtonChangeImg.classList.add('change');
      stringButtonChange.append(stringButtonChangeImg);
      stringButtonChange.addEventListener('click', async function () {
        stringButtonChange.classList.add('on-load');
        await fetch(`http://localhost:3000/api/clients`);
        onEdit({ obj });
        stringButtonChange.classList.remove('on-load');
      });
      let stringButtonDelete = document.createElement('div');
      stringButtonDelete.textContent = 'Удалить'
      stringButtonDelete.classList.add('clients-text');
      stringButtonDelete.classList.add('clients-delete');
      let stringButtonDeleteImg = document.createElement('div');
      stringButtonDeleteImg.classList.add('delete');
      stringButtonDelete.append(stringButtonDeleteImg);
      changeButtonDiv.append(stringButtonChange);
      changeButtonDiv.append(stringButtonDelete);
      columns[5].append(changeButtonDiv);
      columnsElement.push(changeButtonDiv);
      //Delete
      stringButtonDelete.addEventListener('click', function () {
        deleteTable(obj, handlers);
      });
    }
  }
  window.createApp = createApp;
})();
