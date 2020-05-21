var userId = '';
var n = true;
var userNotes = [];
var currentNoteId = 1589945524057;
var root = document.documentElement;

var toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],               
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      
  [{ 'indent': '-2'}, { 'indent': '+2' }],          
  [{ 'direction': 'rtl' }],                         
  [{ 'size': ['small', false, 'large', 'huge'] }],  
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link', 'image'],
];

var quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: toolbarOptions
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
    console.log(error)
  });
  userId = firebase.auth().currentUser.uid;
}

function signIn() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    console.log(error)
  });
}

function createNewNote() {
  var delta = null;
  delta = quill.getContents();
  firebase.database().ref( userId + '/notes/' + Date.now() ).set({
    rawData: delta,
  });
}

function saveNote() {
  var delta = null;
  setInterval(() => {
    delta = quill.getContents();
    firebase.database().ref( userId + '/notes/' + currentNoteId ).update({
      rawData: delta,
    });
  },15000)
}

function openNote(note) {
  quill.setContents(note)
  currentNoteId = note.id
}

function liveNotesUpdate() {
  firebase.database().ref(userId + 'notes/' + currentNoteId).on('value', (snapshot) => {
    console.log(snapshot.val());
  });
}

function getNotes() {
  firebase.database().ref(userId + '/notes').on('value', (snap) => {
    let aux = snap.val()
    for (note in aux){
      userNotes.push(aux[note])
    }
    for( note in userNotes){
      openNote(userNotes[note].rawData)
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
  root.style.setProperty('--main-color', '#F7F7F7')
  root.style.setProperty('--main-text-color', '#000')
  root.style.setProperty('--main-toolbar-color', '#000')
  root.style.setProperty('--main-toolbar-color-contrast', '#FFF')
  document.getElementById('logo').style.filter = 'invert(100%) sepia(99%) saturate(2%) hue-rotate(310deg) brightness(109%) contrast(101%)';
}

function draculaTheme() {
  root.style.setProperty('--main-color', '#282a36')
  root.style.setProperty('--main-text-color', '#ffb86c')
  root.style.setProperty('--main-toolbar-color', '#ff79c6')
  root.style.setProperty('--main-toolbar-color-contrast', '#FFF')
  document.getElementById('logo').style.filter = 'invert(100%) sepia(99%) saturate(2%) hue-rotate(310deg) brightness(109%) contrast(101%)';
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