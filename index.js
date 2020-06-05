var userId = '';
var n = true;
var userNotebooks = [];
var notesIds;
var currentNoteId = 0;
var currentNotebookId = 0;
var root = document.documentElement;
var select = document.getElementById("notesSwitcher");
var notebookSelect = document.getElementById("notebooksSwitcher");

var toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        
  ['blockquote', 'code-block'],              
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],                        
  [{ 'size': ['small', false, 'large', 'huge'] }],  
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link', 'image'],
];

var quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar:  toolbarOptions,
    imageResize: {
      displaySize: true
    }
  }
});

function toggleNavbar () {
  n = !n;
  if (n) {
    document.getElementById("navbar").style.display = 'none';
  } else {
    document.getElementById("navbar").style.display = 'flex';
  }
}

var firebaseConfig = {
  apiKey: "AIzaSyAFp5zbuqwNVUGJWnuZDL_jCkmcdcvsUyI",
  authDomain: "minimalnotes-59a04.firebaseapp.com",
  databaseURL: "https://minimalnotes-59a04.firebaseio.com",
  projectId: "minimalnotes-59a04",
  storageBucket: "minimalnotes-59a04.appspot.com",
  messagingSenderId: "790151065064",
  appId: "1:790151065064:web:5e4f4acdef405ef265485d",
  measurementId: "G-FDX2CVTVPR"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

function signUp() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    console.log(error);
  }).then(() => {
    userId = firebase.auth().currentUser.uid;
    createNewNotebook("Inbox");
  });
}

function signIn() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    console.log(error);
  });
}

function loadSavedTheme(){
  firebase.database().ref(userId + '/currentTheme').once('value', (snap) => {
    var aux = snap.val();
    var switcher = document.getElementById('themeSwitcher');
    if (aux){
      switch(aux.name){  
        case "Original":
          originalTheme()
          break
        case "Simple White":
          simpleWhiteTheme()
          break
        case "Dracula":
          draculaTheme();
          break
        case "USA":
          usaTheme()
          break
        case "Razzzr":
          razzzrTheme()
          break
        case "Coffee Buzz":
          coffeeBuzzTheme()
          break
        default:
          originalTheme()
          break
      }
      switcher.value = aux.name;
    }
  })
}

function createNewNotebook() {
  var name = prompt("Please enter your notebook name", "New Notebook");
  var notebookId = Date.now();
  currentNotebookId = notebookId;
  firebase.database().ref( userId + '/notebooks/' + notebookId ).set({
    notes: [],
    id: notebookId,
    name : name
  });
  var el = document.createElement("option");
  var opt = name;
  el.textContent = opt;
  el.value = opt;
  el.selected = true;
  notebookSelect.appendChild(el);
  userNotebooks.push({
    notes: [],
    id: notebookId,
    name : name
  });
  select.innerHTML = null;
  createNewNote();
}

function deleteNotebook() {
  firebase.database().ref( userId + '/notebooks/' + currentNotebookId ).remove();
  for (var i = 0; i <userNotebooks.length; i++){
    if(userNotebooks[i].id == currentNotebookId ){
      userNotebooks.splice(i,1);
      notebookSelect.remove(i);
    }
  }
  getNotes();
}

function openNotebook() {
  var aux = notebookSelect.value;
  userNotebooks.forEach((notebook, i) => {
    if (notebook.name == aux){
      currentNotebookId = notebook.id;
      currentNotebookIndex = i
    }
  })
  getNotes();
}

async function getNotebooks() {
  notebookSelect.innerHTML = null;
  await firebase.database().ref(userId + '/notebooks').once('value', (snap) => {
    var aux = snap.val();
    userNotebooks = [];
    for (notebook in aux){
      userNotebooks.push(aux[notebook])
      var el = document.createElement("option");
      var opt = aux[notebook].name;
      el.textContent = opt;
      el.value = opt;
      notebookSelect.appendChild(el);
    }
    currentNotebookId = userNotebooks[0].id;
    getNotes();
  })
  openNotebook();
}

function createNewNote() {
  var delta = {ops:[{"attributes":{"size":"huge"},"insert":"NEW NOTE...."},{"insert":"\n"}]};
  quill.setContents(delta);
  currentNoteId = Date.now();
  firebase.database().ref( userId + '/notebooks/' + currentNotebookId + '/notes/' + currentNoteId).set({
    rawData: delta,
    id: currentNoteId
  });
  var el = document.createElement("option");
  var opt = "New Note";
  el.textContent = opt;
  el.value = opt;
  el.selected = true;
  select.appendChild(el);
  userNotebooks[notebookSelect.selectedIndex].notes[currentNoteId] = {
    rawData: delta,
    id: currentNoteId
  };
}

function saveNote() {
  var delta = {};
  delta = quill.getContents();
  firebase.database().ref( userId + '/notebooks/' + currentNotebookId + '/notes/' + currentNoteId ).update({
    rawData: delta,
    id: currentNoteId
  });
  for (var i = 0; i < notesIds.length; i++){
    if(notesIds[i] == currentNoteId ){
      userNotebooks[notebookSelect.selectedIndex].notes[notesIds[i]].rawData = delta;
    }
  }
  select.options[select.selectedIndex].textContent = delta.ops[0].insert;
}

function deleteNote() {
  firebase.database().ref( userId + '/notebooks/' + currentNotebookId + '/notes/' + currentNoteId).remove();
  delete userNotebooks[notebookSelect.selectedIndex].notes[currentNoteId];
  if(Object.keys(userNotebooks[notebookSelect.selectedIndex].notes).length <= 0){
    deleteNotebook();
  } else {
    for (var i = 0; i <notesIds.length; i++){
      if(notesIds[i] == currentNoteId ){
        if(i != 0){
          quill.setContents(userNotebooks[notebookSelect.selectedIndex].notes[notesIds[i-1]].rawData);
        } else {
          quill.setContents(userNotebooks[notebookSelect.selectedIndex].notes[notesIds[i+1]].rawData);
        }
        select.remove(i);
      }
    }
  }
}

function openNote() {
  var aux = select.value;
  for(var i = 0; i < notesIds.length; i++){
    if (userNotebooks[notebookSelect.selectedIndex].notes[aux].id == aux){
      quill.setContents(userNotebooks[notebookSelect.selectedIndex].notes[aux].rawData);
      currentNoteId = userNotebooks[notebookSelect.selectedIndex].notes[aux].id;
    } else {
      quill.setContents(userNotebooks[notebookSelect.selectedIndex].notes[notesIds[0]].rawData);
      currentNoteId = userNotebooks[notebookSelect.selectedIndex].notes[notesIds[0]].id;
    }
  }
}

function getNotes() {
  notesIds = Object.keys(userNotebooks[notebookSelect.selectedIndex].notes);
  select.innerHTML = null;
  for (let i = 0; i < notesIds.length; i++){
    var el = document.createElement("option");
    var opt = userNotebooks[notebookSelect.selectedIndex].notes[notesIds[i]].rawData.ops[0].insert;
    el.textContent = opt;
    el.value = userNotebooks[notebookSelect.selectedIndex].notes[notesIds[i]].id;
    select.appendChild(el);
  }
  openNote();
}

function downloadFile(){
  var delta = document.getElementById('editor').innerText
  var blob = new Blob([delta],
      { type: "text/plain;charset=utf-8" });
  saveAs(blob, select.options[select.selectedIndex].textContent + ".txt");
}

function moveNote(){
  var name = prompt("Please the name of the notebook you want to transfer this note to:", "-");
  for(var i = 0; i < userNotebooks.length; i++){
    if (userNotebooks[i].name == name){
      firebase.database().ref( userId + '/notebooks/' + currentNotebookId + '/notes/' + currentNoteId).remove();
      firebase.database().ref( userId + '/notebooks/' + userNotebooks[i].id + '/notes/' + currentNoteId).set(userNotebooks[notebookSelect.selectedIndex].notes[currentNoteId]);
      userNotebooks[i].notes[currentNoteId] = userNotebooks[notebookSelect.selectedIndex].notes[currentNoteId];
      delete userNotebooks[notebookSelect.selectedIndex].notes[currentNoteId];
    }
  }
  if(Object.keys(userNotebooks[notebookSelect.selectedIndex].notes).length <= 0){
    deleteNotebook();
  }
}







// THEME SELECTION
function originalTheme() {
  root.style.setProperty('--main-color', '#333')
  root.style.setProperty('--main-text-color', '#FFF')
  root.style.setProperty('--main-toolbar-color', '#FFF')
  root.style.setProperty('--main-toolbar-color-contrast', '#FFF')
  document.getElementById('logo').style.filter = 'invert(0%) sepia(99%) saturate(2%) hue-rotate(310deg) brightness(109%) contrast(101%)';
}

function simpleWhiteTheme() {
  root.style.setProperty('--main-color', '#F2F2F2')
  root.style.setProperty('--main-text-color', '#0D0D0D')
  root.style.setProperty('--main-toolbar-color', '#0D0D0D')
  root.style.setProperty('--main-toolbar-color-contrast', '#F2F2F2')
  document.getElementById('logo').style.filter = 'invert(100%) sepia(99%) saturate(2%) hue-rotate(310deg) brightness(109%) contrast(101%)';
}

function draculaTheme() {
  root.style.setProperty('--main-color', '#282a36')
  root.style.setProperty('--main-text-color', '#ffb86c')
  root.style.setProperty('--main-toolbar-color', '#ff79c6')
  root.style.setProperty('--main-toolbar-color-contrast', '#FFF')
  document.getElementById('logo').style.filter = 'invert(69%) sepia(37%) saturate(2176%) hue-rotate(289deg) brightness(102%) contrast(101%)';
}

function usaTheme() {
  root.style.setProperty('--main-color', '#F8F8F8')
  root.style.setProperty('--main-text-color', '#3C3B6E')
  root.style.setProperty('--main-toolbar-color', '#B22234')
  root.style.setProperty('--main-toolbar-color-contrast', '#FFF')
  document.getElementById('logo').style.filter = 'brightness(0) saturate(100%) invert(23%) sepia(9%) saturate(3324%) hue-rotate(202deg) brightness(93%) contrast(92%)';
}

function razzzrTheme() {
  root.style.setProperty('--main-color', '#131313')
  root.style.setProperty('--main-text-color', '#F5F5F5')
  root.style.setProperty('--main-toolbar-color', '#00FF00')
  root.style.setProperty('--main-toolbar-color-contrast', '#FFF')
  document.getElementById('logo').style.filter = 'invert(64%) sepia(64%) saturate(4644%) hue-rotate(85deg) brightness(121%) contrast(125%)';
}

function coffeeBuzzTheme() {
  root.style.setProperty('--main-color', '#fffbd5')
  root.style.setProperty('--main-text-color', '#313131')
  root.style.setProperty('--main-toolbar-color', '#2B0F0E')
  root.style.setProperty('--main-toolbar-color-contrast', '#FFF')
  document.getElementById('logo').style.filter = 'invert(6%) sepia(65%) saturate(1608%) hue-rotate(334deg) brightness(83%) contrast(96%)';
}

function themeSwitcher() {
  var theme = document.getElementById('themeSwitcher').value 
  switch(theme){  
    case "Original":
      originalTheme()
      break
    case "Simple White":
      simpleWhiteTheme()
      break
    case "Dracula":
      draculaTheme()
      break
    case "USA":
      usaTheme()
      break
    case "Razzzr":
      razzzrTheme()
      break
    case "Coffee Buzz":
      coffeeBuzzTheme()
      break
    default:
      originalTheme()
      break
  }
  firebase.database().ref( userId + '/currentTheme/').set({
    name: theme
  });
  toggleNavbar();
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userId = firebase.auth().currentUser.uid;
    document.getElementById('logDiv').style.display = 'none';
    loadSavedTheme();
    getNotebooks();
    document.getElementById("notesDiv").style.display = 'flex';
  } else {
    document.getElementById('logDiv').style.display = 'flex';
    document.getElementById("navbar").style.display = 'flex';
  }
});