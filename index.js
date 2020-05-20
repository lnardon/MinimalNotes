var userId = '';
var n = true;
var userNotes = [];
var currentNoteId = 1589945524057;

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


// black and white
function blackAndWhitTheme() {
  document.getElementById('editor').style.setProperty('--main-color', '#F7F7F7')
  document.getElementById('editorContainer').style.setProperty('--main-color', '#F7F7F7')
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