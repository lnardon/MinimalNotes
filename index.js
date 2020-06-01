var userId = '';
var n = true;
var as = null;
var userNotes = [];
var currentNoteId = 0;
var root = document.documentElement;
var select = document.getElementById("notesSwitcher");

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
  });
  userId = firebase.auth().currentUser.uid;
}

function signIn() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    console.log(error);
  });
}

function createNewNote() {
  var delta = {};
  currentNoteId = Date.now();
  quill.setContents(delta);
  firebase.database().ref( userId + '/notes/' + currentNoteId ).set({
    rawData: delta,
    id: currentNoteId
  });
  var el = document.createElement("option");
  var opt = "New Note";
  el.textContent = opt;
  el.value = opt;
  el.selected = true;
  select.appendChild(el);
}

function saveNote() {
  var delta = {};
  delta = quill.getContents();
  firebase.database().ref( userId + '/notes/' + currentNoteId ).set({
    rawData: delta,
    id: currentNoteId
  });
  for (var i = 0; i < userNotes.length; i++){
    if(userNotes[i].id == currentNoteId ){
      userNotes[i].rawData = delta;
    }
  }
  select.options[select.selectedIndex].textContent = delta.ops[0].insert;
}

function deleteNote() {
  firebase.database().ref( userId + '/notes/' + currentNoteId ).remove();
  for (var i = 0; i <userNotes.length; i++){
    if(userNotes[i].id == currentNoteId ){
      userNotes.splice(i,1)
      select.remove(i)
      quill.setContents(userNotes[i-1].rawData)
    }
  }
}

function openNote() {
  var aux = select.value;
  userNotes.forEach((note) => {
    if (note.id == aux){
      quill.setContents(note.rawData);
      currentNoteId = note.id;
    }
  })
}

function getNotes() {
  select.innerHTML = null;
  firebase.database().ref(userId + '/notes').once('value', (snap) => {
    var aux = snap.val();
    userNotes = [];
    for (note in aux){
      userNotes.push(aux[note])
      var el = document.createElement("option");
      var opt = aux[note].rawData.ops[0].insert;
      el.textContent = opt;
      el.value = aux[note].id;
      select.appendChild(el);
    }
  })
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
    default:
      originalTheme()
      break
  }
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userId = firebase.auth().currentUser.uid;
    document.getElementById('logDiv').style.display = 'none';
    getNotes()
    document.getElementById("notesDiv").style.display = 'flex';
  } else {
    document.getElementById('logDiv').style.display = 'flex';
    document.getElementById("navbar").style.display = 'flex';
  }
});